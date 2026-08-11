export function validateCreateProduct(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!body["productName"] || typeof body["productName"] !== "string" || !body["productName"].trim())
    errors["productName"] = "Product name is required";

  if (!body["sku"] || typeof body["sku"] !== "string" || !body["sku"].trim())
    errors["sku"] = "SKU is required";

  if (!body["category"] || typeof body["category"] !== "string" || !body["category"].trim())
    errors["category"] = "Category is required";

  const price = Number(body["unitPrice"]);
  if (body["unitPrice"] === undefined || isNaN(price) || price < 0)
    errors["unitPrice"] = "Valid non-negative price is required";

  const currentStock = Number(body["currentStock"]);
  if (body["currentStock"] === undefined || !Number.isInteger(currentStock) || currentStock < 0)
    errors["currentStock"] = "Valid non-negative integer stock is required";

  const minStock = Number(body["minimumStock"]);
  if (body["minimumStock"] === undefined || !Number.isInteger(minStock) || minStock < 0)
    errors["minimumStock"] = "Valid non-negative minimum stock is required";

  if (body["warehouseLocation"] && typeof body["warehouseLocation"] !== "string")
    errors["warehouseLocation"] = "Warehouse location must be a string";

  return errors;
}

export function validateUpdateProduct(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (body["unitPrice"] !== undefined) {
    const price = Number(body["unitPrice"]);
    if (isNaN(price) || price < 0) errors["unitPrice"] = "Price must be non-negative";
  }

  if (body["currentStock"] !== undefined) {
    const stock = Number(body["currentStock"]);
    if (!Number.isInteger(stock) || stock < 0) errors["currentStock"] = "Stock must be non-negative integer";
  }

  if (body["minimumStock"] !== undefined) {
    const min = Number(body["minimumStock"]);
    if (!Number.isInteger(min) || min < 0) errors["minimumStock"] = "Minimum stock must be non-negative integer";
  }

  return errors;
}