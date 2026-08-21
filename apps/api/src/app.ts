import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { tasksRouter } from "./routes/tasks.js";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { timelogsRouter } from "./routes/timelogs.js";
import { notesRouter } from "./routes/notes.js";
import { searchRouter } from "./routes/search.js";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true, exposedHeaders: ["X-Row-Count"] }));
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/tasks", tasksRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/timelogs", timelogsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/search", searchRouter);
