import { Router } from "express";
import * as XLSX from "xlsx";
import { TimeLog } from "../models/TimeLog.js";
import { Task } from "../models/Task.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const timelogsRouter = Router();

timelogsRouter.use(requireAuth);

function applyMonthRange(filter: Record<string, unknown>, month: unknown) {
  if (typeof month === "string" && /^\d{4}-\d{2}$/.test(month)) {
    const [year, monthIndex] = month.split("-").map(Number);
    filter.startTime = { $gte: new Date(year, monthIndex - 1, 1), $lt: new Date(year, monthIndex, 1) };
  }
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMinutes(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

timelogsRouter.get("/", async (req, res) => {
  const { taskId, projectId, month, page, pageSize } = req.query;
  const filter: Record<string, unknown> = { owner: req.user!._id };
  if (typeof taskId === "string" && taskId) filter.task = taskId;
  if (typeof projectId === "string" && projectId) filter.project = projectId;
  applyMonthRange(filter, month);

  if (typeof page === "string") {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(String(pageSize ?? "20"), 10) || 20));
    const [items, total] = await Promise.all([
      TimeLog.find(filter)
        .sort({ startTime: -1 })
        .skip((pageNum - 1) * size)
        .limit(size),
      TimeLog.countDocuments(filter),
    ]);
    return res.json({ items, total, page: pageNum, pageSize: size, totalPages: Math.max(1, Math.ceil(total / size)) });
  }

  const timelogs = await TimeLog.find(filter).sort({ startTime: -1 });
  res.json(timelogs);
});

timelogsRouter.get("/active", async (req, res) => {
  const timelog = await TimeLog.findOne({ owner: req.user!._id, endTime: null });
  res.json(timelog ?? null);
});

timelogsRouter.get("/export", async (req, res) => {
  const { projectId, month } = req.query;
  const filter: Record<string, unknown> = { owner: req.user!._id, endTime: { $ne: null } };
  if (typeof projectId === "string" && projectId) filter.project = projectId;
  applyMonthRange(filter, month);

  const logs = await TimeLog.find(filter)
    .populate<{ task: { _id: unknown; title: string } }>("task", "title")
    .populate<{ project: { _id: unknown; name: string } }>("project", "name")
    .sort({ startTime: -1 });

  const groups = new Map<
    string,
    { project: string; date: string; task: string; totalMinutes: number; sortKey: number }
  >();

  for (const log of logs) {
    const start = log.startTime;
    const end = log.endTime!;
    const dateKey = localDateKey(start);
    const key = `${log.task._id}|${dateKey}`;
    const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

    const existing = groups.get(key);
    if (existing) {
      existing.totalMinutes += minutes;
    } else {
      groups.set(key, {
        project: log.project.name,
        date: dateKey,
        task: log.task.title,
        totalMinutes: minutes,
        sortKey: start.getTime(),
      });
    }
  }

  const rows = Array.from(groups.values()).sort((a, b) => b.sortKey - a.sortKey);

  const sheetRows = rows.map((r, i) => ({
    "S.No": i + 1,
    Project: r.project,
    Date: r.date,
    Task: r.task,
    "Total Time": formatMinutes(r.totalMinutes),
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Time Logs");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const filenamePart = typeof month === "string" && month ? month : "all-time";
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="time-logs-${filenamePart}.xlsx"`);
  res.setHeader("X-Row-Count", String(rows.length));
  res.send(buffer);
});

timelogsRouter.post("/", async (req, res) => {
  const { taskId } = req.body ?? {};

  if (typeof taskId !== "string" || !taskId) {
    return res.status(400).json({ error: "Task is required" });
  }

  const task = await Task.findOne({ _id: taskId, owner: req.user!._id, deletedAt: null });
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (task.status === "todo") {
    task.status = "in-progress";
    await task.save();
  }

  const running = await TimeLog.findOne({ owner: req.user!._id, endTime: null });
  if (running) {
    if (String(running.task) === taskId) {
      return res.status(409).json({ error: "Timer already running for this task" });
    }
    running.endTime = new Date();
    await running.save();
  }

  const timelog = await TimeLog.create({
    task: taskId,
    project: task.project,
    owner: req.user!._id,
    startTime: new Date(),
  });

  res.status(201).json(timelog);
});

timelogsRouter.post("/:id/stop", async (req, res) => {
  const timelog = await TimeLog.findOne({ _id: req.params.id, owner: req.user!._id });
  if (!timelog) return res.status(404).json({ error: "Time log not found" });
  if (timelog.endTime) return res.status(409).json({ error: "Time log already stopped" });

  timelog.endTime = new Date();
  await timelog.save();
  res.json(timelog);
});

timelogsRouter.post("/manual", async (req, res) => {
  const { taskId, startTime, endTime } = req.body ?? {};

  if (typeof taskId !== "string" || !taskId) {
    return res.status(400).json({ error: "Task is required" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: "Valid start and end time are required" });
  }
  if (end <= start) {
    return res.status(400).json({ error: "End time must be after start time" });
  }

  const task = await Task.findOne({ _id: taskId, owner: req.user!._id, deletedAt: null });
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (task.status === "todo") {
    task.status = "in-progress";
    await task.save();
  }

  const timelog = await TimeLog.create({
    task: taskId,
    project: task.project,
    owner: req.user!._id,
    startTime: start,
    endTime: end,
    source: "manual",
  });

  res.status(201).json(timelog);
});

timelogsRouter.put("/:id", async (req, res) => {
  const { startTime, endTime } = req.body ?? {};

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: "Valid start and end time are required" });
  }
  if (end <= start) {
    return res.status(400).json({ error: "End time must be after start time" });
  }

  const timelog = await TimeLog.findOne({ _id: req.params.id, owner: req.user!._id });
  if (!timelog) return res.status(404).json({ error: "Time log not found" });
  if (!timelog.endTime) {
    return res.status(400).json({ error: "Stop the running timer before editing this entry" });
  }

  timelog.startTime = start;
  timelog.endTime = end;
  await timelog.save();
  res.json(timelog);
});

timelogsRouter.delete("/:id", async (req, res) => {
  const timelog = await TimeLog.findOne({ _id: req.params.id, owner: req.user!._id });
  if (!timelog) return res.status(404).json({ error: "Time log not found" });
  if (!timelog.endTime) {
    return res.status(400).json({ error: "Stop the running timer before deleting this entry" });
  }

  await timelog.deleteOne();
  res.status(204).send();
});
