import type { Request, Response, NextFunction } from "express";
import { loginUser, getUserById } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginUser(email, password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.user!.id);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}
