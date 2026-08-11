import prisma from "../config/db.js";
import type { Prisma } from "@prisma/client";
import { createError } from "../middleware/error.middleware.js";

export interface ProductQuery {
  page: number;
  limit: number;
  search?: string | undefined;
  category?: string | undefined;
  lowStock?: boolean | undefined;
}

export async function listProducts(query: ProductQuery) {
  const { page, limit, search, category, lowStock } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(category && { category: { contains: category, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { productName: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  let resultData = data;
  if (lowStock) {
    resultData = data.filter(p => p.currentStock <= p.minimumStock);
  }

  return { data: resultData, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw createError("Product not found", 404);
  return product;
}

export async function createProduct(data: {
  productName: string; sku: string; category: string; unitPrice: number;
  currentStock: number; minimumStock: number; warehouseLocation?: string;
}) {
  const existing = await prisma.product.findUnique({ where: { sku: data.sku.trim() } });
  if (existing) throw createError("SKU already exists", 409);

  return prisma.product.create({
    data: {
      productName: data.productName.trim(),
      sku: data.sku.trim(),
      category: data.category.trim(),
      unitPrice: data.unitPrice,
      currentStock: data.currentStock,
      minimumStock: data.minimumStock,
      warehouseLocation: data.warehouseLocation?.trim() ?? "",
    },
  });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw createError("Product not found", 404);

  if (data["sku"] && data["sku"] !== product.sku) {
    const conflict = await prisma.product.findUnique({ where: { sku: data["sku"] as string } });
    if (conflict) throw createError("SKU already exists", 409);
  }

  const updateData: Record<string, unknown> = {};
  if (data["productName"] !== undefined) updateData.productName = (data["productName"] as string).trim();
  if (data["sku"] !== undefined) updateData.sku = (data["sku"] as string).trim();
  if (data["category"] !== undefined) updateData.category = (data["category"] as string).trim();
  if (data["unitPrice"] !== undefined) updateData.unitPrice = Number(data["unitPrice"]);
  if (data["currentStock"] !== undefined) updateData.currentStock = Number(data["currentStock"]);
  if (data["minimumStock"] !== undefined) updateData.minimumStock = Number(data["minimumStock"]);
  if (data["warehouseLocation"] !== undefined) updateData.warehouseLocation = (data["warehouseLocation"] as string)?.trim() ?? null;

  return prisma.product.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw createError('Product not found', 404);
  return prisma.product.delete({ where: { id } });
}