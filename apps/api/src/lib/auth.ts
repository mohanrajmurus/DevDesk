import jwt from "jsonwebtoken";
import type { Response } from "express";

export const COOKIE_NAME = "devdesk_token";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN_MS = Number(process.env.JWT_EXPIRES_IN_MS ?? 30 * 24 * 60 * 60 * 1000);

export interface TokenPayload {
  sub: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_MS / 1000 });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// In production the web and API are deployed on separate domains, so the auth
// cookie has to be sent on cross-site requests: that requires SameSite=None,
// which browsers only honour together with Secure.
const crossSite = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  sameSite: crossSite ? ("none" as const) : ("lax" as const),
  secure: crossSite,
  path: "/",
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: JWT_EXPIRES_IN_MS });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}
