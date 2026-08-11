import type { Request, Response, NextFunction } from "express";
import { generateChallanPDF } from "../services/challanPdf.service.js";

export async function exportChallanPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new Error("Challan ID is required");
    }
    
    // Generate PDF
    const pdfBuffer = await generateChallanPDF(id);
    
    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="challan-${id}.pdf"`);
    
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

