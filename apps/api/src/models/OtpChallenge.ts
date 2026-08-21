import { Schema, model } from "mongoose";

export interface IOtpChallenge {
  fullPhone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const otpChallengeSchema = new Schema<IOtpChallenge>(
  {
    fullPhone: { type: String, required: true, unique: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Mongo auto-deletes a challenge the moment it expires, so abandoned
// login attempts don't linger in the collection.
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpChallenge = model<IOtpChallenge>("OtpChallenge", otpChallengeSchema);
