import { Router } from "express";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Note } from "../models/Note.js";
import { TimeLog } from "../models/TimeLog.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.post("/", async (req, res) => {
  const { name, description, status, color, clientName, countryCode, phone, email, address, country } =
    req.body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Project name is required" });
  }
  if (
    !color ||
    typeof color.name !== "string" ||
    typeof color.hex !== "string" ||
    !color.name.trim() ||
    !color.hex.trim()
  ) {
    return res.status(400).json({ error: "Project color is required" });
  }

  const project = await Project.create({
    name: name.trim(),
    description: description ?? "",
    status,
    color: { name: color.name, hex: color.hex },
    clientName,
    countryCode,
    phone,
    email,
    address,
    country,
    owner: req.user!._id,
  });

  res.status(201).json(project);
});

projectsRouter.get("/", async (req, res) => {
  const projects = await Project.find({ owner: req.user!._id, deletedAt: null }).sort({ createdAt: -1 });
  res.json(projects);
});

projectsRouter.get("/:id", async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user!._id, deletedAt: null });
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

projectsRouter.put("/:id", async (req, res) => {
  const { name, description, status, color, clientName, countryCode, phone, email, address, country } =
    req.body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Project name is required" });
  }
  if (
    !color ||
    typeof color.name !== "string" ||
    typeof color.hex !== "string" ||
    !color.name.trim() ||
    !color.hex.trim()
  ) {
    return res.status(400).json({ error: "Project color is required" });
  }

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!._id, deletedAt: null },
    {
      name: name.trim(),
      description: description ?? "",
      status,
      color: { name: color.name, hex: color.hex },
      clientName,
      countryCode,
      phone,
      email,
      address,
      country,
    },
    { new: true }
  );

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

projectsRouter.delete("/:id", async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!._id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!project) return res.status(404).json({ error: "Project not found" });

  await Task.updateMany(
    { project: project._id, owner: req.user!._id, deletedAt: null },
    { deletedAt: new Date() }
  );
  await Note.deleteMany({ project: project._id, owner: req.user!._id });
  await TimeLog.deleteMany({ project: project._id, owner: req.user!._id });

  res.status(204).send();
});
