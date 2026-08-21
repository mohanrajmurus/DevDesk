import { Schema, model, type Types } from "mongoose";

export interface IProjectColor {
  name: string;
  hex: string;
}

export interface IProjectCountry {
  name: string;
  flag: string;
}

export type ProjectStatus = "active" | "on-hold" | "completed";

export interface IProject {
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
  owner: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectColorSchema = new Schema<IProjectColor>(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const projectCountrySchema = new Schema<IProjectCountry>(
  {
    name: { type: String, required: true },
    flag: { type: String, required: true },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "on-hold", "completed"], default: "active" },
    color: { type: projectColorSchema, required: true },
    clientName: { type: String },
    countryCode: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    country: { type: projectCountrySchema },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Project = model<IProject>("Project", projectSchema);
