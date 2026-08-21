import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { DUMMY_FULL_PHONE } from "./lib/seedConfig.js";
import { User } from "./models/User.js";
import { Project } from "./models/Project.js";
import { Task } from "./models/Task.js";
import { Note } from "./models/Note.js";
import { TimeLog } from "./models/TimeLog.js";
import { OtpChallenge } from "./models/OtpChallenge.js";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/devdesk";

async function seedClear() {
  await connectDB(MONGODB_URI);

  const user = await User.findOne({ fullPhone: DUMMY_FULL_PHONE });

  if (!user) {
    console.log("No seeded dummy user found — nothing to clear.");
    await mongoose.disconnect();
    return;
  }

  const [timeLogs, notes, tasks, projects] = await Promise.all([
    TimeLog.deleteMany({ owner: user._id }),
    Note.deleteMany({ owner: user._id }),
    Task.deleteMany({ owner: user._id }),
    Project.deleteMany({ owner: user._id }),
  ]);
  await OtpChallenge.deleteMany({ fullPhone: DUMMY_FULL_PHONE });
  await User.deleteOne({ _id: user._id });

  console.log("Cleared dummy data:");
  console.log(`  Projects: ${projects.deletedCount}`);
  console.log(`  Tasks: ${tasks.deletedCount}`);
  console.log(`  Notes: ${notes.deletedCount}`);
  console.log(`  Time logs: ${timeLogs.deletedCount}`);
  console.log("  Dummy user removed.");

  await mongoose.disconnect();
}

seedClear().catch((err) => {
  console.error("Seed clear failed", err);
  process.exit(1);
});
