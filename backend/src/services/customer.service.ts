import prisma from "../config/db.js";
import type { CustomerStatus, CustomerType, Prisma } from "@prisma/client";
import { createError } from "../middleware/error.middleware.js";

export interface CustomerQuery {
  page: number;
  limit: number;
  search?: string | undefined;
  status?: CustomerStatus | undefined;
  customerType?: CustomerType | undefined;
}

export async function listCustomers(query: CustomerQuery) {
  const { page, limit, search, status, customerType } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {
    ...(status && { status }),
    ...(customerType && { customerType }),
    ...(search && {
      OR: [
        { customerName: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: { createdByUser: { select: { name: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: { orderBy: { createdAt: "desc" }, include: { createdByUser: { select: { name: true } } } },
      createdByUser: { select: { name: true } },
    },
  });
  if (!customer) throw createError("Customer not found", 404);
  return customer;
}

export async function createCustomer(data: {
  customerName: string; mobile: string; email?: string; businessName: string;
  gstNumber?: string; customerType: CustomerType; address: string;
  status?: CustomerStatus; followUpDate?: string; notes?: string; createdBy: string;
}) {
  const existing = await prisma.customer.findUnique({ where: { mobile: data.mobile.trim() } });
  if (existing) throw createError("Mobile number already registered", 409);

  return prisma.customer.create({
    data: {
      customerName: data.customerName.trim(),
      mobile: data.mobile.trim(),
      email: data.email?.trim() || null,
      businessName: data.businessName.trim(),
      gstNumber: data.gstNumber?.trim() || null,
      customerType: data.customerType,
      address: data.address.trim(),
      status: data.status ?? "LEAD",
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes?.trim() || null,
      createdBy: data.createdBy,
    },
  });
}

export async function updateCustomer(id: string, data: Record<string, unknown>) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw createError("Customer not found", 404);

  if (data["mobile"] && data["mobile"] !== customer.mobile) {
    const conflict = await prisma.customer.findUnique({ where: { mobile: data["mobile"] as string } });
    if (conflict) throw createError("Mobile number already registered", 409);
  }

  return prisma.customer.update({
    where: { id },
    data: {
      ...(data["customerName"] !== undefined && { customerName: (data["customerName"] as string).trim() }),
      ...(data["mobile"] !== undefined && { mobile: (data["mobile"] as string).trim() }),
      ...(data["email"] !== undefined && { email: (data["email"] as string)?.trim() || null }),
      ...(data["businessName"] !== undefined && { businessName: (data["businessName"] as string).trim() }),
      ...(data["gstNumber"] !== undefined && { gstNumber: (data["gstNumber"] as string)?.trim() || null }),
      ...(data["customerType"] !== undefined && { customerType: data["customerType"] as CustomerType }),
      ...(data["address"] !== undefined && { address: (data["address"] as string).trim() }),
      ...(data["status"] !== undefined && { status: data["status"] as CustomerStatus }),
      ...(data["followUpDate"] !== undefined && { followUpDate: data["followUpDate"] ? new Date(data["followUpDate"] as string) : null }),
      ...(data["notes"] !== undefined && { notes: (data["notes"] as string)?.trim() || null }),
    },
  });
}

export async function deleteCustomer(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw createError('Customer not found', 404);

  // Delete related challans (and their items via cascade) before deleting customer
  const deleted = await prisma.$transaction(async (tx) => {
    await tx.challan.deleteMany({ where: { customerId: id } });
    const d = await tx.customer.delete({ where: { id } });
    return d;
  });

  return deleted;
}

export async function addFollowUp(customerId: string, note: string, followUpDate: string, createdBy: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw createError("Customer not found", 404);

  return prisma.followUp.create({
    data: { customerId, note: note.trim(), followUpDate: new Date(followUpDate), createdBy },
  });
}

export async function getFollowUps(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw createError("Customer not found", 404);

  return prisma.followUp.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { createdByUser: { select: { name: true } } },
  });
}

export interface CustomerChallanSummary {
  total: number;
  confirmed: number;
  draft: number;
  cancelled: number;
  paid: number;
  unpaid: number;
}

export async function getCustomerChallans(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      customerName: true,
      businessName: true,
    },
  });
  if (!customer) throw createError("Customer not found", 404);

  const challans = await prisma.challan.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      createdByUser: { select: { name: true } },
    },
  });

  // Calculate summary
  const summary: CustomerChallanSummary = {
    total: 0,
    confirmed: 0,
    draft: 0,
    cancelled: 0,
    paid: 0,
    unpaid: 0,
  };

  for (const challan of challans) {
    summary.total++;
    if (challan.status === "CONFIRMED") summary.confirmed++;
    if (challan.status === "DRAFT") summary.draft++;
    if (challan.status === "CANCELLED") summary.cancelled++;
    if (challan.paymentStatus === "PAID") summary.paid++;
    if (challan.paymentStatus === "UNPAID") summary.unpaid++;
  }

  return {
    customer,
    summary,
    challans,
  };
}
