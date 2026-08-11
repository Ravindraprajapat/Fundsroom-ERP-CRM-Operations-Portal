import prisma from "../config/db.js";
import { createError } from "../middleware/error.middleware.js";
import { generateChallanNumber } from "../utils/challanNumber.js";

export interface ChallanQuery {
  page: number;
  limit: number;
  status?: "DRAFT" | "CONFIRMED" | "CANCELLED" | undefined;
  customerId?: string | undefined;
  paymentStatus?: "UNPAID" | "PAID" | undefined;
  search?: string | undefined;
}

export async function listChallans(query: ChallanQuery) {
  const { page, limit, status, customerId, paymentStatus, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...(paymentStatus && { paymentStatus }),
    ...(search && {
      OR: [
        { challanNumber: { contains: search, mode: "insensitive" } },
        { customer: { customerName: { contains: search, mode: "insensitive" } } },
        { customer: { businessName: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.challan.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { customerName: true, businessName: true } },
        createdByUser: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getChallan(id: string) {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: { select: { customerName: true, businessName: true, mobile: true, email: true, address: true, gstNumber: true } },
      items: true,
      createdByUser: { select: { name: true } },
    },
  });
  if (!challan) throw createError("Challan not found", 404);
  return challan;
}

export async function createChallan(customerId: string, items: { productId: string; quantity: number }[], createdBy: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw createError("Customer not found", 404);

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i: any) => i.productId) } },
  });

  if (products.length !== items.length) {
    throw createError("One or more products not found", 400);
  }

  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));
  let totalQuantity = 0;

  const challanItems = items.map((item: any) => {
    const product = productMap.get(item.productId);
    if (!product) throw createError("Product not found", 400);
    totalQuantity += item.quantity;
    return {
      productId: product.id,
      productName: product.productName,
      sku: product.sku,
      unitPrice: product.unitPrice,
      quantity: item.quantity,
    };
  });

  const challanNumber = await generateChallanNumber();

  return prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      status: "DRAFT",
      paymentStatus: "UNPAID",
      createdBy,
      items: { create: challanItems },
    },
    include: { items: true, customer: { select: { customerName: true, businessName: true } } },
  });
}

export async function confirmChallan(id: string) {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!challan) throw createError("Challan not found", 404);
  if (challan.status !== "DRAFT") throw createError("Only draft challans can be confirmed", 400);

  const products = await prisma.product.findMany({
    where: { id: { in: challan.items.map((i: any) => i.productId) } },
  });

  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

  for (const item of challan.items) {
    const product = productMap.get(item.productId);
    if (!product) throw createError(`Product ${item.sku} not found`, 400);
    if (product.currentStock < item.quantity) {
      throw createError(`Insufficient stock for ${product.productName}. Available: ${product.currentStock}, Required: ${item.quantity}`, 400);
    }
  }

  return prisma.$transaction(async (tx: any) => {
    for (const item of challan.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: product.currentStock - item.quantity },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "OUT",
          reason: `Challan ${challan.challanNumber}`,
          createdBy: challan.createdBy,
        },
      });
    }

    return tx.challan.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: { items: true, customer: { select: { customerName: true, businessName: true } } },
    });
  });
}

export async function cancelChallan(id: string) {
  const challan = await prisma.challan.findUnique({ where: { id } });
  if (!challan) throw createError("Challan not found", 404);
  if (challan.status !== "DRAFT") throw createError("Only draft challans can be cancelled", 400);

  return prisma.challan.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}

export async function markChallanAsPaid(id: string) {
  const challan = await prisma.challan.findUnique({ where: { id } });
  if (!challan) throw createError("Challan not found", 404);
  
  if (challan.status !== "CONFIRMED") {
    throw createError("Only confirmed challans can be marked as paid", 400);
  }
  
  if (challan.paymentStatus === "PAID") {
    throw createError("Challan is already paid", 409);
  }

  return prisma.challan.update({
    where: { id },
    data: { paymentStatus: "PAID" },
  });
}

export async function updateDraftChallan(
  id: string,
  customerId: string,
  items: { productId: string; quantity: number }[],
) {
  const challan = await prisma.challan.findUnique({ where: { id } });
  if (!challan) throw createError("Challan not found", 404);
  if (challan.status !== "DRAFT") throw createError("Only draft challans can be edited", 400);

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw createError("Customer not found", 404);

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i: any) => i.productId) } },
  });

  if (products.length !== items.length) {
    throw createError("One or more products not found", 400);
  }

  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));
  let totalQuantity = 0;

  const challanItems = items.map((item: any) => {
    const product = productMap.get(item.productId);
    if (!product) throw createError("Product not found", 400);
    totalQuantity += item.quantity;
    return {
      productId: product.id,
      productName: product.productName,
      sku: product.sku,
      unitPrice: product.unitPrice,
      quantity: item.quantity,
    };
  });

  // Delete existing items and create new ones
  await prisma.challanItem.deleteMany({ where: { challanId: id } });

  return prisma.challan.update({
    where: { id },
    data: {
      customerId,
      totalQuantity,
      items: { create: challanItems },
    },
    include: { items: true, customer: { select: { customerName: true, businessName: true } } },
  });
}