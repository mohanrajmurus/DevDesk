import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 5);
export const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

function otpSecret() {
  return process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || "dev-secret-change-me";
}

export function generateOtp(): string {
  return String(randomInt(0, 10000)).padStart(4, "0");
}

export function hashOtp(otp: string, fullPhone: string): string {
  return createHmac("sha256", otpSecret()).update(`${fullPhone}:${otp}`).digest("hex");
}

export function verifyOtp(otp: string, fullPhone: string, hash: string): boolean {
  const expected = Buffer.from(hashOtp(otp, fullPhone), "hex");
  const actual = Buffer.from(hash, "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
