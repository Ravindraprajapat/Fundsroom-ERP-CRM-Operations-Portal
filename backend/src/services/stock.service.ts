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

async function getValidUserId(createdBy: string): Promise<string> {
  if (createdBy) {
    const user = await prisma.user.findUnique({ where: { id: createdBy } });
    if (user) return user.id;
  }
  const fallbackUser = await prisma.user.findFirst();
  if (fallbackUser) return fallbackUser.id;
  throw createError("No valid user found to perform stock operation", 400);
}

export async function stockIn(productId: string, quantity: number, reason: string, createdBy: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError("Product not found", 404);

  const numQty = Number(quantity);
  if (!Number.isInteger(numQty) || numQty <= 0) {
    throw createError("Quantity must be a positive integer", 400);
  }

  const validUserId = await getValidUserId(createdBy);

  return prisma.$transaction(async (tx: any) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: product.currentStock + numQty,
      },
    });

    await tx.stockMovement.create({
      data: {
        productId,
        quantity: numQty,
        type: "IN",
        reason: (reason || "").trim(),
        createdBy: validUserId,
      },
    });

    return updatedProduct;
  });
}

export async function stockOut(productId: string, quantity: number, reason: string, createdBy: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError("Product not found", 404);

  const numQty = Number(quantity);
  if (!Number.isInteger(numQty) || numQty <= 0) {
    throw createError("Quantity must be a positive integer", 400);
  }

  if (product.currentStock < numQty) {
    throw createError(`Insufficient stock for ${product.productName}. Available: ${product.currentStock}`, 400);
  }

  const validUserId = await getValidUserId(createdBy);

  return prisma.$transaction(async (tx: any) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: product.currentStock - numQty,
      },
    });

    await tx.stockMovement.create({
      data: {
        productId,
        quantity: numQty,
        type: "OUT",
        reason: (reason || "").trim(),
        createdBy: validUserId,
      },
    });

    return updatedProduct;
  });
}