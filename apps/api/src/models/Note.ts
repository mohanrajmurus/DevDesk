import { Schema, model, type Types } from "mongoose";

export interface INote {
  title: string;
  content: string;
  project: Types.ObjectId;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export const Note = model<INote>("Note", noteSchema);
