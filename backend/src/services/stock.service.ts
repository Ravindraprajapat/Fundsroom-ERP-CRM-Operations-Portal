import prisma from "../config/db.js";
import { createError } from "../middleware/error.middleware.js";

export interface StockMovementQuery {
  page: number;
  limit: number;
  productId?: string | undefined;
  type?: "IN" | "OUT" | undefined;
}

export async function listMovements(query: StockMovementQuery) {
  const { page, limit, productId, type } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(productId && { productId }),
    ...(type && { type }),
  };

  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { productName: true, sku: true } },
        createdByUser: { select: { name: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function stockIn(productId: string, quantity: number, reason: string, createdBy: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError("Product not found", 404);

  return prisma.product.update({
    where: { id: productId },
    data: {
      currentStock: product.currentStock + quantity,
      stockMovements: {
        create: {
          productId,
          quantity,
          type: "IN",
          reason: reason.trim(),
          createdBy,
        },
      },
    },
  });
}

export async function stockOut(productId: string, quantity: number, reason: string, createdBy: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError("Product not found", 404);

  if (product.currentStock < quantity) {
    throw createError(`Insufficient stock for ${product.productName}. Available: ${product.currentStock}`, 400);
  }

  return prisma.product.update({
    where: { id: productId },
    data: {
      currentStock: product.currentStock - quantity,
      stockMovements: {
        create: {
          productId,
          quantity,
          type: "OUT",
          reason: reason.trim(),
          createdBy,
        },
      },
    },
  });
}