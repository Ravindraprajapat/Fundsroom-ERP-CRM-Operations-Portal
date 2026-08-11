import PDFDocument from "pdfkit";
import prisma from "../config/db.js";
import { createError } from "../middleware/error.middleware.js";

export async function generateChallanPDF(challanId: string): Promise<Buffer> {
  const challan = await prisma.challan.findUnique({
    where: { id: challanId },
    include: {
      customer: true,
      items: true,
      createdByUser: {
        select: { name: true },
      },
    },
  });

  if (!challan) {
    throw createError("Challan not found", 404);
  }

  const companyInfo = {
    name: "FUNDSROOM",
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header - Company Name
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(companyInfo.name, { align: "center" })
      .moveDown(0.3);

    // Title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("SALES CHALLAN", { align: "center" })
      .moveDown(1);

    // Challan Details
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Challan No: ${challan.challanNumber}`, { align: "left" });
    doc.text(`Date: ${new Date(challan.createdAt ?? Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`, { align: "left" });
    doc.moveDown(0.5);

    // Customer Details Section
    doc.fontSize(14).font("Helvetica-Bold").text("CUSTOMER", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Name: ${challan.customer.customerName}`);
    doc.text(`Business: ${challan.customer.businessName}`);
    doc.text(`Mobile: ${challan.customer.mobile}`);
    if (challan.customer.email) doc.text(`Email: ${challan.customer.email}`);
    if (challan.customer.gstNumber) doc.text(`GST: ${challan.customer.gstNumber}`);
    doc.text(`Address: ${challan.customer.address}`);
    doc.moveDown(1);

    // Products Table Header
    doc.fontSize(12).font("Helvetica-Bold");
    const tableLeft = 50;
    const colWidths = [50, 200, 80, 100, 80];
    const headers = ["S.No", "Product", "SKU", "Unit Price", "Qty"];
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);

    // Draw header background
    doc.rect(tableLeft, doc.y - 5, totalWidth, 22).fill("#f0f0f0");

    let xPos = tableLeft + 5;
    headers.forEach((header, i) => {
      doc.text(header, xPos, doc.y - 3, { width: colWidths[i]! - 10, align: i === 1 ? "left" : "center" });
      xPos += colWidths[i]!;
    });
    doc.moveDown(0.5);

    // Draw items
    doc.fontSize(11).font("Helvetica");
    challan.items.forEach((item, index) => {
      xPos = tableLeft + 5;
      
      doc.text(`${index + 1}`, xPos, doc.y, { width: colWidths[0]! - 10, align: "center" });
      xPos += colWidths[0]!;
      doc.text(item.productName, xPos, doc.y, { width: colWidths[1]! - 10, align: "left" });
      xPos += colWidths[1]!;
      doc.text(item.sku, xPos, doc.y, { width: colWidths[2]! - 10, align: "center" });
      xPos += colWidths[2]!;
      doc.text(`?${Number(item.unitPrice).toFixed(2)}`, xPos, doc.y, { width: colWidths[3]! - 10, align: "right" });
      xPos += colWidths[3]!;
      doc.text(`${item.quantity}`, xPos, doc.y, { width: colWidths[4]! - 10, align: "center" });

      doc.moveDown(0.8);
    });

    // Draw line above total
    doc.moveTo(tableLeft, doc.y).lineTo(tableLeft + totalWidth, doc.y).stroke();
    doc.moveDown(0.5);

    // Total Quantity
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total Quantity: ${challan.totalQuantity}`, { align: "right" });
    doc.moveDown(1);

    // Status
    doc.fontSize(11).font("Helvetica");
    doc.text(`Status: ${challan.status}`);
    doc.text(`Payment Status: ${challan.paymentStatus}`);
    doc.moveDown(0.5);
    doc.text(`Created By: ${challan.createdByUser.name}`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font("Helvetica").text("This is a computer generated challan.", { align: "center" });

    doc.end();
  });
}
