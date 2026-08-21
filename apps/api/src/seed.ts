import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { DUMMY_COUNTRY_CODE, DUMMY_FULL_PHONE, DUMMY_PHONE } from "./lib/seedConfig.js";
import { User } from "./models/User.js";
import { Project, type IProjectColor, type IProjectCountry, type ProjectStatus } from "./models/Project.js";
import { Task, type TaskPriority, type TaskStatus } from "./models/Task.js";
import { Note } from "./models/Note.js";
import { TimeLog } from "./models/TimeLog.js";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/devdesk";

const COLORS: IProjectColor[] = [
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Orange", hex: "#F97316" },
];

const PROJECT_DEFS: {
  name: string;
  description: string;
  status: ProjectStatus;
  color: IProjectColor;
  clientName?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: IProjectCountry;
}[] = [
  {
    name: "Website Redesign",
    description: "Revamp the marketing site with a new design system.",
    status: "active",
    color: COLORS[0],
    clientName: "Acme Corp",
    countryCode: "+91",
    phone: "9876543210",
    email: "contact@acme.test",
    address: "12 MG Road, Bengaluru, India",
    country: { name: "India", flag: "🇮🇳" },
  },
  {
    name: "Mobile App",
    description: "Cross-platform app for order tracking.",
    status: "active",
    color: COLORS[1],
    clientName: "Northwind Traders",
  },
  {
    name: "Internal Tools",
    description: "Dashboards and admin tooling for the ops team.",
    status: "on-hold",
    color: COLORS[2],
  },
  {
    name: "Q3 Marketing Campaign",
    description: "Cross-channel campaign for the Q3 product launch.",
    status: "completed",
    color: COLORS[3],
    clientName: "Globex Inc",
  },
];

const TASK_TEMPLATES: { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueInDays: number }[] = [
  { title: "Set up project repo", description: "Initialize repo structure and CI", status: "done", priority: "high", dueInDays: -14 },
  { title: "Design high-fidelity mockups", description: "Figma mockups for key screens", status: "done", priority: "high", dueInDays: -9 },
  { title: "Build core API endpoints", description: "CRUD endpoints for the main resource", status: "in-progress", priority: "high", dueInDays: 2 },
  { title: "Wire up frontend data layer", description: "React Query hooks and state", status: "in-progress", priority: "medium", dueInDays: 5 },
  { title: "Write onboarding docs", description: "Docs for new team members", status: "todo", priority: "low", dueInDays: 10 },
  { title: "QA pass on critical flow", description: "End-to-end test the main user flow", status: "todo", priority: "medium", dueInDays: 7 },
];

const NOTE_TEMPLATES = [
  { title: "Kickoff notes", content: "<p>Discussed scope, timeline, and key stakeholders on the initial call.</p>" },
  { title: "Open questions", content: "<p>Need clarification on <strong>hosting</strong> and final asset delivery format.</p>" },
];

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

async function clearUserData(ownerId: mongoose.Types.ObjectId) {
  await TimeLog.deleteMany({ owner: ownerId });
  await Note.deleteMany({ owner: ownerId });
  await Task.deleteMany({ owner: ownerId });
  await Project.deleteMany({ owner: ownerId });
}

async function seed() {
  await connectDB(MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { fullPhone: DUMMY_FULL_PHONE },
    {
      $setOnInsert: { countryCode: DUMMY_COUNTRY_CODE, phone: DUMMY_PHONE, fullPhone: DUMMY_FULL_PHONE },
      $set: {
        name: "Demo User",
        email: "demo@devdesk.test",
        profession: "Product Manager",
        city: "Bengaluru",
        profileComplete: true,
      },
    },
    { upsert: true, new: true }
  );

  // Re-runnable: wipe this dummy user's previous data before reseeding.
  await clearUserData(user._id);

  const projects = await Project.insertMany(PROJECT_DEFS.map((p) => ({ ...p, owner: user._id })));

  let taskCount = 0;
  let noteCount = 0;
  let timeLogCount = 0;

  for (const [projectIndex, project] of projects.entries()) {
    const tasks = await Task.insertMany(
      TASK_TEMPLATES.map((t) => ({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: daysFromNow(t.dueInDays),
        project: project._id,
        owner: user._id,
      }))
    );
    taskCount += tasks.length;

    await Note.insertMany(
      NOTE_TEMPLATES.map((n) => ({ ...n, project: project._id, owner: user._id }))
    );
    noteCount += NOTE_TEMPLATES.length;

    // Completed time logs on the two "in progress"/"done" tasks.
    const loggableTasks = tasks.filter((t) => t.status !== "todo");
    for (const [taskIndex, task] of loggableTasks.entries()) {
      const entries = 2;
      for (let i = 0; i < entries; i++) {
        const start = hoursAgo((taskIndex + 1) * 26 + i * 5);
        const end = new Date(start.getTime() + (30 + i * 20) * 60_000);
        await TimeLog.create({
          task: task._id,
          project: project._id,
          owner: user._id,
          startTime: start,
          endTime: end,
          source: i === 0 ? "timer" : "manual",
        });
        timeLogCount++;
      }
    }

    // Leave one running timer on the first "in-progress" task of the first project,
    // so the dashboard's active-timer UI has something to show right after seeding.
    if (projectIndex === 0) {
      const runningTask = tasks.find((t) => t.status === "in-progress");
      if (runningTask) {
        await TimeLog.create({
          task: runningTask._id,
          project: project._id,
          owner: user._id,
          startTime: hoursAgo(0.25),
          source: "timer",
        });
        timeLogCount++;
      }
    }
  }

  console.log("Seed complete:");
  console.log(`  Projects: ${projects.length}`);
  console.log(`  Tasks: ${taskCount}`);
  console.log(`  Notes: ${noteCount}`);
  console.log(`  Time logs: ${timeLogCount}`);
  console.log("");
  console.log(`Log in with phone ${DUMMY_COUNTRY_CODE} ${DUMMY_PHONE} — the dev OTP is printed by the API on send.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
