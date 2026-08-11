import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const customers = await prisma.customer.count();
    const products = await prisma.product.count();
    console.log(`Database check: ${customers} customers, ${products} products`);
    await prisma.$disconnect();
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

check();
