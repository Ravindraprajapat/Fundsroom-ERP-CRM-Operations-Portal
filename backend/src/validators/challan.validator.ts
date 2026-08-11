export function validateCreateChallan(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!body["customerId"] || typeof body["customerId"] !== "string" || !body["customerId"].trim())
    errors["customerId"] = "Customer is required";

  if (!body["items"] || !Array.isArray(body["items"]) || body["items"].length === 0)
    errors["items"] = "At least one item is required";
  else {
    (body["items"] as unknown[]).forEach((item, index) => {
      if (typeof item !== "object" || item === null) {
        errors[`items[${index}]`] = "Invalid item format";
        return;
      }
      const itemObj = item as Record<string, unknown>;
      if (!itemObj["productId"] || typeof itemObj["productId"] !== "string" || !itemObj["productId"].trim())
        errors[`items[${index}].productId`] = "Product ID is required";
      const qty = Number(itemObj["quantity"]);
      if (itemObj["quantity"] === undefined || !Number.isInteger(qty) || qty <= 0)
        errors[`items[${index}].quantity`] = "Quantity must be a positive integer";
    });
  }

  return errors;
}