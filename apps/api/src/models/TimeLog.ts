import { Schema, model, type Types } from "mongoose";

export type TimeLogSource = "timer" | "manual";

export interface ITimeLog {
  task: Types.ObjectId;
  project: Types.ObjectId;
  owner: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  source: TimeLogSource;
}

const timeLogSchema = new Schema<ITimeLog>({
  task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
  source: { type: String, enum: ["timer", "manual"], default: "timer" },
});

export const TimeLog = model<ITimeLog>("TimeLog", timeLogSchema);
