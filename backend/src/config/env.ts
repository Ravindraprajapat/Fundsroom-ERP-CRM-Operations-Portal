import "dotenv/config";

const env = {
  DATABASE_URL: process.env["DATABASE_URL"] as string,
  JWT_SECRET: process.env["JWT_SECRET"] as string,
  PORT: Number(process.env["PORT"]) || 5000,
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
  FRONTEND_URL: process.env["FRONTEND_URL"] ?? "http://localhost:5173",
  AWS_ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY_ID"] as string,
  AWS_SECRET_ACCESS_KEY: process.env["AWS_SECRET_ACCESS_KEY"] as string,
  AWS_BUCKET_NAME: process.env["AWS_BUCKET_NAME"] as string,
};

const missing = (Object.keys(env) as (keyof typeof env)[]).filter(
  (key) => env[key] === undefined || env[key] === ""
);

if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

export default env;
