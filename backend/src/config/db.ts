import * as PrismaClientPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import env from "./env.js";

dotenv.config();

const PrismaClientConstructor =
  (PrismaClientPkg as any).PrismaClient ||
  (PrismaClientPkg as any).default?.PrismaClient;

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
if (adapter) console.log("database connected ");

const prisma = new PrismaClientConstructor({ adapter });

export default prisma;
