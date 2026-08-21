import { Router } from "express";
import { Note } from "../models/Note.js";
import { Project } from "../models/Project.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.get("/", async (req, res) => {
  const { projectId } = req.query;
  const filter: Record<string, unknown> = { owner: req.user!._id };
  if (typeof projectId === "string" && projectId) filter.project = projectId;

  const notes = await Note.find(filter).sort({ createdAt: -1 });
  res.json(notes);
});

notesRouter.get("/:id", async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, owner: req.user!._id });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

notesRouter.post("/", async (req, res) => {
  const { title, content, projectId } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Note title is required" });
  }
  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Note content is required" });
  }
  if (typeof projectId !== "string" || !projectId) {
    return res.status(400).json({ error: "Project is required" });
  }

  const project = await Project.findOne({ _id: projectId, owner: req.user!._id, deletedAt: null });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const note = await Note.create({
    title: title.trim(),
    content,
    project: project._id,
    owner: req.user!._id,
  });

  res.status(201).json(note);
});

notesRouter.put("/:id", async (req, res) => {
  const { title, content } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Note title is required" });
  }
  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Note content is required" });
  }

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!._id },
    { title: title.trim(), content },
    { new: true }
  );

  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});
