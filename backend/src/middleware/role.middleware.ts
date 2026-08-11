import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

export function authorizeRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    next();
  };
}
