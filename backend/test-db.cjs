const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const customers = await prisma.customer.findMany({ take: 3 });
    console.log('Customers found:', customers.length);
    const products = await prisma.product.findMany({ take: 3 });
    console.log('Products found:', products.length);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
