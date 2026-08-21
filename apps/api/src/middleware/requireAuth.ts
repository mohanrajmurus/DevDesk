import type { Request, Response, NextFunction } from "express";
import { verifyToken, COOKIE_NAME } from "../lib/auth.js";
import { User } from "../models/User.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  req.user = user;
  next();
}
