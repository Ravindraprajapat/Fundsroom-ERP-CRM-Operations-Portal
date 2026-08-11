import PDFDocument from "pdfkit";
import prisma from "../config/db.js";
import { createError } from "../middleware/error.middleware.js";

interface InvoiceData {
  challan: any;
  customer: any;
  items: any[];
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst?: string;
  };
}

export async function generateInvoicePDF(challanId: string): Promise<Buffer> {
  // Fetch challan with all details
  const challan = await prisma.challan.findUnique({
    where: { id: challanId },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      createdByUser: {
        select: { name: true, email: true },
      },
    },
  });

  if (!challan) {
    throw createError("Challan not found", 404);
  }

  if (challan.status !== "CONFIRMED") {
    throw createError("Only confirmed challans can generate invoices", 400);
  }

  const companyInfo = {
    name: "Fundsroom ERP",
    address: "123 Business Park, Industrial Area",
    phone: "+91 98765 43210",
    email: "info@fundsroom.com",
    gst: "27AABCU9603R1ZM",
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const margin = 36;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - margin * 2;
    const darkText = "#111111";
    const secondaryText = "#4b5563";
    const borderColor = "#d1d5db";
    const headerBg = "#f9fafb";
    const sectionSpacing = 14;
    const cardPadding = 12;
    const tableLineGap = 2;

    const formatText = (value: any) => {
      if (value === undefined || value === null || value === "") {
        return "-";
      }
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);
    };

    const formatCurrency = (value: any) => {
      const number = typeof value === "string" ? Number(value) : Number(value);
      if (!isFinite(number)) {
        return "-";
      }
      return `₹${number.toFixed(2)}`;
    };

    const formatDate = (value: any) => {
      if (value === undefined || value === null || value === "") {
        return "-";
      }
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "-";
      }
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const ensurePageSpace = (requiredHeight: number) => {
      if (doc.y + requiredHeight > pageHeight - margin) {
        doc.addPage();
        doc.y = margin;
        doc.font("Helvetica").fontSize(8.5).fillColor(darkText);
      }
    };

    const drawHeader = (y: number) => {
      doc.font("Helvetica-Bold").fontSize(22).fillColor(darkText).text("TAX INVOICE", margin, y, {
        width: contentWidth,
        align: "center",
      });
      doc.moveDown(0.4);
      doc.lineWidth(1).strokeColor(borderColor).moveTo(margin, doc.y).lineTo(pageWidth - margin, doc.y).stroke();
      return doc.y + sectionSpacing;
    };

    const drawInvoiceDetails = (y: number) => {
      const leftWidth = contentWidth * 0.55;
      const rightWidth = contentWidth - leftWidth - 12;

      doc.font("Helvetica-Bold").fontSize(12).fillColor(darkText).text(companyInfo.name, margin, y, {
        width: leftWidth,
      });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText).text(companyInfo.address, {
        width: leftWidth,
        lineGap: tableLineGap,
      });
      doc.text(`Phone: ${formatText(companyInfo.phone)}`, { lineGap: tableLineGap });
      doc.text(`Email: ${formatText(companyInfo.email)}`, { lineGap: tableLineGap });
      doc.text(`GSTIN: ${formatText(companyInfo.gst)}`, { lineGap: tableLineGap });
      const leftBottom = doc.y;

      const rightX = margin + leftWidth + 12;
      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText).text("Invoice Details", rightX, y, {
        width: rightWidth,
      });
      const detailsTop = y + 18;
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText).text(`Invoice Number: ${formatText(challan.challanNumber)}`, rightX, detailsTop, {
        width: rightWidth,
        lineGap: tableLineGap,
      });
      doc.text(`Invoice Date: ${formatDate(challan.createdAt)}`);
      doc.text(`Created By: ${formatText(challan.createdByUser?.name)}`);
      doc.text(`Status: ${formatText(challan.status)}`);
      const rightBottom = doc.y;

      return Math.max(leftBottom, rightBottom) + sectionSpacing;
    };

    const drawCustomerSummary = (y: number) => {
      const leftCardWidth = contentWidth * 0.5 - 8;
      const rightCardWidth = contentWidth * 0.5 - 8;

      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText);
      const customerTitleHeight = doc.heightOfString("Customer Details", { width: leftCardWidth - cardPadding * 2 });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText);
      const customerContent = [
        `Name: ${formatText(challan.customer.customerName)}`,
        `Business: ${formatText(challan.customer.businessName)}`,
        `Mobile: ${formatText(challan.customer.mobile)}`,
        `Email: ${formatText(challan.customer.email)}`,
        `GSTIN: ${formatText(challan.customer.gstNumber)}`,
        `Address: ${formatText(challan.customer.address)}`,
      ].join("\n");
      const customerContentHeight = doc.heightOfString(customerContent, {
        width: leftCardWidth - cardPadding * 2,
        lineGap: tableLineGap,
      });
      const customerCardHeight = customerTitleHeight + customerContentHeight + cardPadding * 2 + 6;

      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText);
      const summaryTitleHeight = doc.heightOfString("Invoice Summary", { width: rightCardWidth - cardPadding * 2 });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText);
      const summaryContent = [
        `Total Quantity: ${formatText(challan.totalQuantity)}`,
        `Payment Status: ${formatText(challan.paymentStatus)}`,
        `Invoice Date: ${formatDate(challan.createdAt)}`,
        `Generated By: ${formatText(challan.createdByUser?.name)}`,
        `Status: ${formatText(challan.status)}`,
      ].join("\n");
      const summaryContentHeight = doc.heightOfString(summaryContent, {
        width: rightCardWidth - cardPadding * 2,
        lineGap: tableLineGap,
      });
      const summaryCardHeight = summaryTitleHeight + summaryContentHeight + cardPadding * 2 + 6;

      const cardHeight = Math.max(customerCardHeight, summaryCardHeight);
      ensurePageSpace(cardHeight + sectionSpacing);

      doc.roundedRect(margin, y, leftCardWidth, cardHeight, 6).fillAndStroke(headerBg, borderColor);
      doc.roundedRect(margin + leftCardWidth + 16, y, rightCardWidth, cardHeight, 6).fillAndStroke(headerBg, borderColor);

      doc.fillColor(darkText).font("Helvetica-Bold").fontSize(11).text("Customer Details", margin + cardPadding, y + cardPadding, {
        width: leftCardWidth - cardPadding * 2,
      });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText).text(customerContent, margin + cardPadding, y + cardPadding + customerTitleHeight + 6, {
        width: leftCardWidth - cardPadding * 2,
        lineGap: tableLineGap,
      });

      const rightCardX = margin + leftCardWidth + 16;
      doc.fillColor(darkText).font("Helvetica-Bold").fontSize(11).text("Invoice Summary", rightCardX + cardPadding, y + cardPadding, {
        width: rightCardWidth - cardPadding * 2,
      });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText).text(summaryContent, rightCardX + cardPadding, y + cardPadding + summaryTitleHeight + 6, {
        width: rightCardWidth - cardPadding * 2,
        lineGap: tableLineGap,
      });

      return y + cardHeight + sectionSpacing;
    };

    const drawProductTable = (y: number) => {
      const tableX = margin;
      const tableWidths: [number, number, number, number, number] = [32, 250, 50, 65, 70];
      const [colSNo, colProduct, colQty, colUnitPrice, colAmount] = tableWidths;
      const tableTotalWidth = tableWidths.reduce((a, b) => a + b, 0);
      const rowMinHeight = 22;
      const headerHeight = 26;

      let cursorY = y;
      const renderTableHeader = () => {
        ensurePageSpace(headerHeight + 6);
        doc.rect(tableX, cursorY, tableTotalWidth, headerHeight).fill(headerBg);
        doc.strokeColor(borderColor).lineWidth(0.8).rect(tableX, cursorY, tableTotalWidth, headerHeight).stroke();
        doc.font("Helvetica-Bold").fontSize(9).fillColor(darkText);

        const headers = ["S.No", "Product Name", "Qty", "Unit Price", "Amount"];
        let x = tableX;
        headers.forEach((text, index) => {
          const width = tableWidths[index] as number;
          doc.text(text, x + 6, cursorY + 8, {
            width: width - 12,
            align: index === 1 ? "left" : "center",
          });
          x += width;
        });

        cursorY += headerHeight;
      };

      renderTableHeader();
      doc.font("Helvetica").fontSize(8.5).fillColor(darkText);

      challan.items.forEach((item, index) => {
        const productName = formatText(item.productName || item.product?.productName);
        const qtyText = formatText(item.quantity);
        const unitPriceText = formatCurrency(item.unitPrice);
        const amountValue = Number(item.unitPrice) * Number(item.quantity);
        const amountText = formatCurrency(amountValue);

        const productHeight = doc.heightOfString(productName, {
          width: colProduct - 12,
          lineGap: tableLineGap,
        });
        const rowHeight = Math.max(rowMinHeight, productHeight + 10);

        if (cursorY + rowHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
          renderTableHeader();
        }

        doc.strokeColor(borderColor).lineWidth(0.4);
        doc.moveTo(tableX, cursorY).lineTo(tableX + tableTotalWidth, cursorY).stroke();
        doc.moveTo(tableX, cursorY + rowHeight).lineTo(tableX + tableTotalWidth, cursorY + rowHeight).stroke();
        let borderX = tableX;
        for (const width of tableWidths) {
          borderX += width;
          doc.moveTo(borderX, cursorY).lineTo(borderX, cursorY + rowHeight).stroke();
        }

        doc.text(String(index + 1), tableX + 6, cursorY + 6, {
          width: colSNo - 12,
          align: "center",
        });
        doc.text(productName, tableX + colSNo + 6, cursorY + 6, {
          width: colProduct - 12,
          align: "left",
          lineGap: tableLineGap,
        });
        doc.text(qtyText, tableX + colSNo + colProduct + 6, cursorY + 6, {
          width: colQty - 12,
          align: "center",
        });
        doc.text(unitPriceText, tableX + colSNo + colProduct + colQty + 6, cursorY + 6, {
          width: colUnitPrice - 12,
          align: "right",
        });
        doc.text(amountText, tableX + colSNo + colProduct + colQty + colUnitPrice + 6, cursorY + 6, {
          width: colAmount - 12,
          align: "right",
        });

        cursorY += rowHeight;
      });

      doc.strokeColor(borderColor).lineWidth(0.4).moveTo(tableX, cursorY).lineTo(tableX + tableTotalWidth, cursorY).stroke();
      return cursorY + sectionSpacing;
    };

    const drawInvoiceTotal = (y: number) => {
      const totals = [
        { label: "Subtotal", value: formatCurrency(challan.items.reduce((sum: number, item: any) => sum + Number(item.unitPrice) * Number(item.quantity), 0)) },
        { label: "Total Amount", value: formatCurrency(challan.items.reduce((sum: number, item: any) => sum + Number(item.unitPrice) * Number(item.quantity), 0)) },
      ];

      const totalsWidth = 240;
      const totalsX = pageWidth - margin - totalsWidth;
      const totalsContent = totals.map((item) => `${item.label}: ${item.value}`).join("\n");
      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText);
      const titleHeight = doc.heightOfString("Invoice Total", { width: totalsWidth - cardPadding * 2 });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText);
      const contentHeight = doc.heightOfString(totalsContent, {
        width: totalsWidth - cardPadding * 2,
        lineGap: tableLineGap,
      });
      const totalsHeight = titleHeight + contentHeight + cardPadding * 2 + 8;

      ensurePageSpace(totalsHeight + sectionSpacing);
      doc.roundedRect(totalsX, y, totalsWidth, totalsHeight, 6).fillAndStroke(headerBg, borderColor);
      doc.fillColor(darkText).font("Helvetica-Bold").fontSize(11).text("Invoice Total", totalsX + cardPadding, y + cardPadding, {
        width: totalsWidth - cardPadding * 2,
      });
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText).text(totalsContent, totalsX + cardPadding, y + cardPadding + titleHeight + 6, {
        width: totalsWidth - cardPadding * 2,
        lineGap: tableLineGap,
      });

      return y + totalsHeight + sectionSpacing;
    };

    const drawTermsAndConditions = (y: number) => {
      const termsTitle = "Terms & Conditions";
      const termsText =
        "1. Goods once sold cannot be exchanged.\n" +
        "2. Payment due within 30 days from invoice date.\n" +
        "3. Subject to local jurisdiction in case of disputes.\n" +
        "4. This is a computer-generated invoice.";

      doc.font("Helvetica-Bold").fontSize(10).fillColor(darkText);
      const titleHeight = doc.heightOfString(termsTitle, { width: contentWidth });
      doc.font("Helvetica").fontSize(8.5).fillColor(secondaryText);
      const termsHeight = doc.heightOfString(termsText, {
        width: contentWidth,
        lineGap: tableLineGap,
      });
      const totalHeight = titleHeight + termsHeight + 10;

      ensurePageSpace(totalHeight);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(darkText).text(termsTitle, margin, y, { width: contentWidth });
      doc.font("Helvetica").fontSize(8.5).fillColor(secondaryText).text(termsText, margin, y + titleHeight + 6, {
        width: contentWidth,
        lineGap: tableLineGap,
      });

      return y + totalHeight;
    };

    let cursorY = margin;
    cursorY = drawHeader(cursorY);
    cursorY = drawInvoiceDetails(cursorY);
    cursorY = drawCustomerSummary(cursorY);
    cursorY = drawProductTable(cursorY);
    cursorY = drawInvoiceTotal(cursorY);
    cursorY = drawTermsAndConditions(cursorY);

    doc.end();
  });
}
