import type { CustomerStatus, CustomerType } from "@prisma/client";

const VALID_TYPES: CustomerType[] = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
const VALID_STATUSES: CustomerStatus[] = ["LEAD", "ACTIVE", "INACTIVE"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCreateCustomer(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!body["customerName"] || typeof body["customerName"] !== "string" || !body["customerName"].trim())
    errors["customerName"] = "Customer name is required";

  if (!body["mobile"] || typeof body["mobile"] !== "string" || !body["mobile"].trim())
    errors["mobile"] = "Mobile is required";
  else if (!/^\d{10,15}$/.test(body["mobile"].trim()))
    errors["mobile"] = "Mobile must be 10-15 digits";

  if (body["email"] && typeof body["email"] === "string" && body["email"].trim() && !isValidEmail(body["email"].trim()))
    errors["email"] = "Valid email is required";

  if (!body["businessName"] || typeof body["businessName"] !== "string" || !body["businessName"].trim())
    errors["businessName"] = "Business name is required";

  if (!body["customerType"] || !VALID_TYPES.includes(body["customerType"] as CustomerType))
    errors["customerType"] = "Customer type must be RETAIL, WHOLESALE, or DISTRIBUTOR";

  if (!body["address"] || typeof body["address"] !== "string" || !body["address"].trim())
    errors["address"] = "Address is required";

  if (body["status"] && !VALID_STATUSES.includes(body["status"] as CustomerStatus))
    errors["status"] = "Status must be LEAD, ACTIVE, or INACTIVE";

  return errors;
}

export function validateUpdateCustomer(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (body["mobile"] !== undefined) {
    if (typeof body["mobile"] !== "string" || !body["mobile"].trim())
      errors["mobile"] = "Mobile cannot be empty";
    else if (!/^\d{10,15}$/.test(body["mobile"].trim()))
      errors["mobile"] = "Mobile must be 10-15 digits";
  }

  if (body["email"] !== undefined && body["email"] !== "" && typeof body["email"] === "string" && !isValidEmail(body["email"].trim()))
    errors["email"] = "Valid email is required";

  if (body["customerType"] !== undefined && !VALID_TYPES.includes(body["customerType"] as CustomerType))
    errors["customerType"] = "Invalid customer type";

  if (body["status"] !== undefined && !VALID_STATUSES.includes(body["status"] as CustomerStatus))
    errors["status"] = "Invalid status";

  return errors;
}

export function validateFollowUp(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!body["note"] || typeof body["note"] !== "string" || !body["note"].trim())
    errors["note"] = "Note is required";

  if (!body["followUpDate"] || typeof body["followUpDate"] !== "string")
    errors["followUpDate"] = "Follow-up date is required";
  else if (isNaN(Date.parse(body["followUpDate"])))
    errors["followUpDate"] = "Valid date is required";

  return errors;
}
