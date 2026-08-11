import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv"
import env from "./env.js";
dotenv.config()

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
if(adapter) console.log("database connected ")

const prisma = new PrismaClient({ adapter });

export default prisma;
