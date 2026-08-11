export function validateStockMovement(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!body["productId"] || typeof body["productId"] !== "string" || !body["productId"].trim())
    errors["productId"] = "Product ID is required";

  const quantity = Number(body["quantity"]);
  if (body["quantity"] === undefined || !Number.isInteger(quantity) || quantity <= 0)
    errors["quantity"] = "Quantity must be a positive integer";

  if (body["type"] !== undefined && !["IN", "OUT"].includes(body["type"] as string))
    errors["type"] = "Type must be IN or OUT";

  if (!body["reason"] || typeof body["reason"] !== "string" || !body["reason"].trim())
    errors["reason"] = "Reason is required";

  return errors;
}