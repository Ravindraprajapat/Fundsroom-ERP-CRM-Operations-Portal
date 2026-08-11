import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] as string });
const prisma = new PrismaClient({ adapter });

// Demo Credentials:
// ADMIN     | admin@fundsroom.com      | Admin@123
// SALES     | sales@fundsroom.com      | Sales@123
// WAREHOUSE | warehouse@fundsroom.com  | Warehouse@123
// ACCOUNTS  | accounts@fundsroom.com   | Accounts@123

async function main() {
  console.log("Seeding...");

  // Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@fundsroom.com" },
      update: {},
      create: { name: "Admin User", email: "admin@fundsroom.com", password: await bcrypt.hash("Admin@123", 10), role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "sales@fundsroom.com" },
      update: {},
      create: { name: "Sales User", email: "sales@fundsroom.com", password: await bcrypt.hash("Sales@123", 10), role: "SALES" },
    }),
    prisma.user.upsert({
      where: { email: "warehouse@fundsroom.com" },
      update: {},
      create: { name: "Warehouse User", email: "warehouse@fundsroom.com", password: await bcrypt.hash("Warehouse@123", 10), role: "WAREHOUSE" },
    }),
    prisma.user.upsert({
      where: { email: "accounts@fundsroom.com" },
      update: {},
      create: { name: "Accounts User", email: "accounts@fundsroom.com", password: await bcrypt.hash("Accounts@123", 10), role: "ACCOUNTS" },
    }),
  ]);

  const [admin, sales] = users;
  console.log("  Users seeded");

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { mobile: "9876543210" },
      update: {},
      create: {
        customerName: "Rajesh Sharma", mobile: "9876543210", email: "rajesh@sharma.com",
        businessName: "Sharma Traders", gstNumber: "27AAPFU0939F1ZV",
        customerType: "WHOLESALE", address: "12 MG Road, Mumbai", status: "ACTIVE",
        notes: "Bulk buyer", createdBy: admin!.id,
      },
    }),
    prisma.customer.upsert({
      where: { mobile: "9123456780" },
      update: {},
      create: {
        customerName: "Priya Mehta", mobile: "9123456780", email: "priya@mehta.com",
        businessName: "Mehta Retail", customerType: "RETAIL",
        address: "45 Linking Road, Bandra", status: "ACTIVE", createdBy: sales!.id,
      },
    }),
    prisma.customer.upsert({
      where: { mobile: "9988776655" },
      update: {},
      create: {
        customerName: "Suresh Patel", mobile: "9988776655",
        businessName: "Patel Distributors", gstNumber: "24AAACP1234A1Z5",
        customerType: "DISTRIBUTOR", address: "78 GIDC, Ahmedabad", status: "LEAD",
        notes: "Interested in bulk pricing", createdBy: sales!.id,
      },
    }),
  ]);
  console.log("  Customers seeded");

  // Follow-ups
  const existingFollowUp = await prisma.followUp.findFirst({ where: { customerId: customers[0]!.id } });
  if (!existingFollowUp) {
    await prisma.followUp.create({
      data: {
        customerId: customers[0]!.id, note: "Discuss Q3 bulk order",
        followUpDate: new Date(Date.now() + 3 * 86400000), createdBy: sales!.id,
      },
    });
    await prisma.followUp.create({
      data: {
        customerId: customers[2]!.id, note: "Send product catalogue",
        followUpDate: new Date(Date.now() + 7 * 86400000), createdBy: sales!.id,
      },
    });
    console.log("  Follow-ups seeded");
  }

  // Products
  const productData = [
    { productName: "Industrial Bolt M10", sku: "BOLT-M10", category: "Fasteners", unitPrice: 2.5, currentStock: 500, minimumStock: 100, warehouseLocation: "Rack A1" },
    { productName: "Steel Nut M10", sku: "NUT-M10", category: "Fasteners", unitPrice: 1.75, currentStock: 450, minimumStock: 100, warehouseLocation: "Rack A2" },
    { productName: "PVC Pipe 1 inch", sku: "PIPE-PVC-1IN", category: "Pipes", unitPrice: 85.0, currentStock: 200, minimumStock: 50, warehouseLocation: "Bay B1" },
    { productName: "Copper Wire 2.5mm", sku: "WIRE-CU-2.5MM", category: "Electrical", unitPrice: 320.0, currentStock: 80, minimumStock: 20, warehouseLocation: "Rack C3" },
    { productName: "Safety Helmet", sku: "PPE-HELM-001", category: "Safety", unitPrice: 450.0, currentStock: 60, minimumStock: 15, warehouseLocation: "Shelf D1" },
    { productName: "Hydraulic Hose 10mm", sku: "HOSE-HYD-10MM", category: "Hydraulics", unitPrice: 175.0, currentStock: 30, minimumStock: 10, warehouseLocation: "Bay B3" },
  ];

  const warehouseUser = users[2]!;
  const products: { id: string; sku: string }[] = [];

  for (const p of productData) {
    const product = await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p });
    products.push(product);
  }
  console.log("  Products seeded");

  // Stock movements
  const existingMovement = await prisma.stockMovement.findFirst({ where: { createdBy: warehouseUser.id } });
  if (!existingMovement) {
    for (const p of products) {
      const productData2 = productData.find((pd) => pd.sku === p.sku)!;
      await prisma.stockMovement.create({
        data: { productId: p.id, quantity: productData2.currentStock, type: "IN", reason: "Initial stock entry", createdBy: warehouseUser.id },
      });
    }
    console.log("  Stock movements seeded");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
