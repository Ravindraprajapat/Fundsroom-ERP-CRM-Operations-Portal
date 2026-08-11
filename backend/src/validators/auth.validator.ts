export interface LoginInput {
  email: string;
  password: string;
}

export function validateLogin(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  const email = body["email"];
  const password = body["password"];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors["email"] = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors["email"] = "Valid email is required";
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors["password"] = "Password is required";
  }

  return errors;
}
