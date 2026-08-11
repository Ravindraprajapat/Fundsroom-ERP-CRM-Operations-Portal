import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { listChallans, getChallan, createChallan, confirmChallan, cancelChallan, markChallanAsPaid, updateDraftChallan } from "../services/challan.service.js";
import type { ChallanStatus } from "@prisma/client";
import { createError } from "../middleware/error.middleware.js";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pageParam = req.query["page"] as string;
    const limitParam = req.query["limit"] as string;
    
    if (pageParam && (isNaN(Number(pageParam)) || Number(pageParam) < 1)) {
      throw createError("Invalid page number. Must be a positive integer.", 400);
    }
    if (limitParam && (isNaN(Number(limitParam)) || Number(limitParam) < 1 || Number(limitParam) > 100)) {
      throw createError("Invalid limit. Must be between 1 and 100.", 400);
    }

    const page = Math.max(1, parseInt(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam) || 20));
    
    const result = await listChallans({
      page, limit,
      status: req.query["status"] as ChallanStatus,
      paymentStatus: req.query["paymentStatus"] as "UNPAID" | "PAID",
      search: req.query["search"] as string,
      customerId: req.query["customerId"] as string,
    });
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in list challans:", err);
      next(createError("Failed to fetch challans. Please try again.", 500));
    }
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    
    if (!id || id.trim() === "") {
      throw createError("Challan ID is required.", 400);
    }

    const challan = await getChallan(id);
    sendSuccess(res, challan);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in get challan by ID:", err);
      next(createError("Failed to fetch challan details.", 500));
    }
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { customerId: string; items: { productId: string; quantity: number }[] };
    
    // Validate required fields
    if (!body.customerId || body.customerId.trim() === "") {
      throw createError("Customer ID is required.", 400);
    }
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw createError("At least one item is required.", 400);
    }
    
    // Validate each item
    for (const item of body.items) {
      if (!item.productId || item.productId.trim() === "") {
        throw createError("Product ID is required for all items.", 400);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw createError(`Quantity must be a positive number for product ${item.productId}.`, 400);
      }
      if (!Number.isInteger(item.quantity)) {
        throw createError(`Quantity must be an integer for product ${item.productId}.`, 400);
      }
    }
    
    if (!req.user || !req.user.id) {
      throw createError("User authentication required.", 401);
    }

    const challan = await createChallan(body.customerId, body.items, req.user.id);
    sendSuccess(res, challan, 201);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in create challan:", err);
      next(createError("Failed to create challan. Please check your input.", 500));
    }
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    
    if (!id || id.trim() === "") {
      throw createError("Challan ID is required.", 400);
    }

    const challan = await confirmChallan(id);
    sendSuccess(res, challan);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in confirm challan:", err);
      next(createError("Failed to confirm challan.", 500));
    }
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    
    if (!id || id.trim() === "") {
      throw createError("Challan ID is required.", 400);
    }

    const challan = await cancelChallan(id);
    sendSuccess(res, challan);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in cancel challan:", err);
      next(createError("Failed to cancel challan.", 500));
    }
  }
}

export async function markPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    
    if (!id || id.trim() === "") {
      throw createError("Challan ID is required.", 400);
    }

    const challan = await markChallanAsPaid(id);
    sendSuccess(res, challan);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in mark challan as paid:", err);
      next(createError("Failed to mark challan as paid.", 500));
    }
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const body = req.body as { customerId: string; items: { productId: string; quantity: number }[] };
    
    if (!id || id.trim() === "") {
      throw createError("Challan ID is required.", 400);
    }
    
    if (!body.customerId || body.customerId.trim() === "") {
      throw createError("Customer ID is required.", 400);
    }
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw createError("At least one item is required.", 400);
    }
    
    for (const item of body.items) {
      if (!item.productId || item.productId.trim() === "") {
        throw createError("Product ID is required for all items.", 400);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw createError(`Quantity must be a positive number for product ${item.productId}.`, 400);
      }
      if (!Number.isInteger(item.quantity)) {
        throw createError(`Quantity must be an integer for product ${item.productId}.`, 400);
      }
    }

    const challan = await updateDraftChallan(id, body.customerId, body.items);
    sendSuccess(res, challan);
  } catch (err) { 
    if (err instanceof Error && (err as any).statusCode) {
      next(err);
    } else {
      console.error("Error in update challan:", err);
      next(createError("Failed to update challan. Please check your input.", 500));
    }
  }
}