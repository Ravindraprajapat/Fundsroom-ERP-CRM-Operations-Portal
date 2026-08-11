import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import prisma from "../config/db.js";

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User account no longer exists. Please log in again." });
      return;
    }

    req.user = { id: user.id, name: user.name || "", email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
