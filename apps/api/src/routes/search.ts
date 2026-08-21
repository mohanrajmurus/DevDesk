import { Router } from "express";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Note } from "../models/Note.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const searchRouter = Router();

searchRouter.use(requireAuth);

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

searchRouter.get("/", async (req, res) => {
  const { q } = req.query;
  const query = typeof q === "string" ? q.trim() : "";

  if (query.length < 2) {
    return res.json({ projects: [], tasks: [], notes: [] });
  }

  const rx = new RegExp(escapeRegex(query), "i");
  const owner = req.user!._id;

  const [projects, tasks, notes] = await Promise.all([
    Project.find({ owner, deletedAt: null, $or: [{ name: rx }, { description: rx }] })
      .select("name status color")
      .limit(6),
    Task.find({ owner, deletedAt: null, $or: [{ title: rx }, { description: rx }] })
      .select("title status priority project")
      .populate("project", "name color")
      .limit(6),
    Note.find({ owner, $or: [{ title: rx }, { content: rx }] })
      .select("title project")
      .populate("project", "name color")
      .limit(6),
  ]);

  res.json({ projects, tasks, notes });
});
