import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { generateInvoicePDF } from "../services/invoice.service.js";

export async function exportInvoicePDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new Error("Invoice ID is required");
    }
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(id);
    
    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${id}.pdf"`);
    
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}