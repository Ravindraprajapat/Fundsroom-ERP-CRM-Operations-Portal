import prisma from "../config/db.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import type { AuthUser } from "../types/auth.types.js";

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!user || !(await comparePassword(password, user.password))) {
    const err = new Error("Invalid email or password") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user.id, role: user.role });
  return {
    user: { id: user.id, name: user.name ?? "", email: user.email, role: user.role },
    token,
  };
}

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    const err = new Error("User not found") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  return { id: user.id, name: user.name ?? "", email: user.email, role: user.role };
}
