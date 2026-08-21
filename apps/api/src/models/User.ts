import { Schema, model } from "mongoose";

export interface IUser {
  countryCode: string;
  phone: string;
  fullPhone: string;
  name?: string;
  email?: string;
  profession?: string;
  city?: string;
  pan?: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    countryCode: { type: String, required: true },
    phone: { type: String, required: true },
    fullPhone: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    profession: { type: String },
    city: { type: String },
    pan: { type: String },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
