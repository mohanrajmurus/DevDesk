import { Router } from "express";
import type { HydratedDocument } from "mongoose";
import { User, type IUser } from "../models/User.js";
import { OtpChallenge } from "../models/OtpChallenge.js";
import { generateOtp, hashOtp, verifyOtp, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from "../lib/otp.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../lib/auth.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidPhone(phone: string) {
  return normalizePhone(phone).length >= 7;
}

function toPublicUser(user: HydratedDocument<IUser>) {
  return {
    id: user.id as string,
    countryCode: user.countryCode,
    phone: user.phone,
    name: user.name,
    email: user.email,
    profession: user.profession,
    city: user.city,
    pan: user.pan,
    profileComplete: user.profileComplete,
  };
}

authRouter.post("/send-otp", async (req, res) => {
  const { countryCode, phone } = req.body ?? {};
  if (!countryCode || !phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: "Enter a valid phone number" });
  }

  const fullPhone = `${countryCode}${normalizePhone(phone)}`;

  await User.findOneAndUpdate(
    { fullPhone },
    { $setOnInsert: { countryCode, phone: normalizePhone(phone), fullPhone, profileComplete: false } },
    { upsert: true }
  );

  const otp = generateOtp();
  const otpHash = hashOtp(otp, fullPhone);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

  await OtpChallenge.findOneAndUpdate(
    { fullPhone },
    { otpHash, expiresAt, attempts: 0 },
    { upsert: true }
  );

  console.log(`[dev] OTP for ${fullPhone}: ${otp}`);

  const response: Record<string, unknown> = { message: "OTP sent" };
  if (process.env.NODE_ENV !== "production") response.devOtp = otp;
  res.json(response);
});

authRouter.post("/verify-otp", async (req, res) => {
  const { countryCode, phone, otp } = req.body ?? {};
  if (!countryCode || !phone || !otp) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const fullPhone = `${countryCode}${normalizePhone(phone)}`;
  const challenge = await OtpChallenge.findOne({ fullPhone });
  if (!challenge) {
    return res.status(400).json({ error: "No OTP request found. Please request a new code." });
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await OtpChallenge.deleteOne({ fullPhone });
    return res.status(400).json({ error: "OTP expired. Please request a new code." });
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    return res.status(400).json({ error: "Too many attempts. Please request a new code." });
  }

  if (!verifyOtp(otp, fullPhone, challenge.otpHash)) {
    challenge.attempts += 1;
    await challenge.save();
    return res.status(400).json({ error: "Incorrect code" });
  }

  await OtpChallenge.deleteOne({ fullPhone });

  const user = await User.findOne({ fullPhone });
  if (!user) {
    return res.status(400).json({ error: "No account found for this phone number" });
  }

  const token = signToken(user.id as string);
  setAuthCookie(res, token);

  res.json({ profileComplete: user.profileComplete, user: toPublicUser(user) });
});

authRouter.post("/complete-profile", requireAuth, async (req, res) => {
  const { name, email, profession, city, pan } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!name?.trim()) errors.name = "Full name is required";
  if (!profession?.trim()) errors.profession = "Profession is required";
  if (!city?.trim()) errors.city = "City is required";
  if (!email?.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  if (pan?.trim() && !PAN_RE.test(pan.trim().toUpperCase())) errors.pan = "Enter a valid PAN number";

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: "Validation failed", fields: errors });
  }

  const user = req.user!;
  user.set({
    name: name.trim(),
    email: email.trim(),
    profession: profession.trim(),
    city: city.trim(),
    pan: pan?.trim() ? pan.trim().toUpperCase() : undefined,
    profileComplete: true,
  });
  await user.save();

  res.json({ user: toPublicUser(user) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: toPublicUser(req.user!) });
});

authRouter.post("/logout", async (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});
