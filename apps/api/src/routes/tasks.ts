import { Router } from "express";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get("/", async (req, res) => {
  const { projectId, status, priority, page, pageSize } = req.query;
  const filter: Record<string, unknown> = { owner: req.user!._id, deletedAt: null };
  if (typeof projectId === "string" && projectId) filter.project = projectId;
  if (typeof status === "string" && status) filter.status = status;
  if (typeof priority === "string" && priority) filter.priority = priority;

  if (typeof page === "string") {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(String(pageSize ?? "20"), 10) || 20));
    const [items, total] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * size)
        .limit(size),
      Task.countDocuments(filter),
    ]);
    return res.json({ items, total, page: pageNum, pageSize: size, totalPages: Math.max(1, Math.ceil(total / size)) });
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json(tasks);
});

tasksRouter.get("/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user!._id, deletedAt: null });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

tasksRouter.post("/", async (req, res) => {
  const { title, description, status, priority, dueDate, projectId } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Task title is required" });
  }
  if (typeof projectId !== "string" || !projectId) {
    return res.status(400).json({ error: "Project is required" });
  }

  const project = await Project.findOne({ _id: projectId, owner: req.user!._id, deletedAt: null });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const task = await Task.create({
    title: title.trim(),
    description: description ?? "",
    status,
    priority,
    dueDate: dueDate || undefined,
    project: project._id,
    owner: req.user!._id,
  });

  res.status(201).json(task);
});

tasksRouter.put("/:id", async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body ?? {};

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!._id, deletedAt: null },
    { title, description, status, priority, dueDate: dueDate || undefined },
    { new: true }
  );

  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

tasksRouter.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!._id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});
