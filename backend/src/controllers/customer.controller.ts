import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, addFollowUp, getFollowUps, getCustomerChallans } from "../services/customer.service.js";
import type { CustomerStatus, CustomerType } from "@prisma/client";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
    const result = await listCustomers({
      page, limit,
      search: req.query["search"] as string,
      status: req.query["status"] as CustomerStatus,
      customerType: req.query["customerType"] as CustomerType,
    });
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const customer = await getCustomer(id);
    sendSuccess(res, customer);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const args: Parameters<typeof createCustomer>[0] = {
      customerName: body["customerName"] as string,
      mobile: body["mobile"] as string,
      businessName: body["businessName"] as string,
      customerType: body["customerType"] as CustomerType,
      address: body["address"] as string,
      createdBy: req.user!.id,
    };
    if (body["email"]) args.email = body["email"] as string;
    if (body["gstNumber"]) args.gstNumber = body["gstNumber"] as string;
    if (body["status"]) args.status = body["status"] as CustomerStatus;
    if (body["followUpDate"]) args.followUpDate = body["followUpDate"] as string;
    if (body["notes"]) args.notes = body["notes"] as string;
    const customer = await createCustomer(args);
    sendSuccess(res, customer, 201);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const customer = await updateCustomer(id, req.body as Record<string, unknown>);
    sendSuccess(res, customer);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    await deleteCustomer(id);
    sendSuccess(res, { message: 'Customer deleted successfully' });
  } catch (err) { next(err); }
}

export async function createFollowUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const body = req.body as { note: string; followUpDate: string };
    const followUp = await addFollowUp(id, body.note, body.followUpDate, req.user!.id);
    sendSuccess(res, followUp, 201);
  } catch (err) { next(err); }
}

export async function listFollowUps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const followUps = await getFollowUps(id);
    sendSuccess(res, followUps);
  } catch (err) { next(err); }
}

export async function getCustomerChallansHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const result = await getCustomerChallans(id);
    sendSuccess(res, result);
  } catch (err) { next(err); }
}
