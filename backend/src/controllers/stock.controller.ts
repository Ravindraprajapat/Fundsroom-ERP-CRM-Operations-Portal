import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { listMovements, stockIn, stockOut } from "../services/stock.service.js";

export async function listMovementsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
    const result = await listMovements({
      page, limit,
      productId: req.query["productId"] as string,
      type: req.query["type"] as "IN" | "OUT",
    });
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  } catch (err) { next(err); }
}

export async function stockInController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { productId: string; quantity: number; reason: string };
    const result = await stockIn(body.productId, body.quantity, body.reason, req.user!.id);
    sendSuccess(res, result, 201);
  } catch (err) { next(err); }
}

export async function stockOutController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { productId: string; quantity: number; reason: string };
    const result = await stockOut(body.productId, body.quantity, body.reason, req.user!.id);
    sendSuccess(res, result, 201);
  } catch (err) { next(err); }
}