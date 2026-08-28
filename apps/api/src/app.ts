import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { tasksRouter } from "./routes/tasks.js";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { timelogsRouter } from "./routes/timelogs.js";
import { notesRouter } from "./routes/notes.js";
import { searchRouter } from "./routes/search.js";

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/devdesk";

export const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true, exposedHeaders: ["X-Row-Count"] }));
app.use(cookieParser());
app.use(express.json());

// Liveness check — deliberately before the DB gate so it answers even when
// Mongo is down.
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Ensure a DB connection before any route runs. connectDB caches the
// connection and collapses concurrent connects, so this is a cheap await on
// warm serverless instances.
app.use((_req, _res, next) => {
  connectDB(MONGODB_URI).then(() => next(), next);
});

app.use("/api/tasks", tasksRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/timelogs", timelogsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/search", searchRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
