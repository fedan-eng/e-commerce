// lib/stock.js — what can be bought. A product has a whole-product switch (`availability`)
// and each colour has its own (`colors[].inStock`); both default to in stock when missing.
// Shared by the storefront, /api/cart/prices and lib/pricing.js so they always agree.

const sameName = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

export const colorInStock = (color) => color?.inStock !== false;

// The product can be bought in at least one colour (or has no colours and is switched on)
export function productInStock(product) {
  if (!product || product.availability === false) return false;
  const colors = product.colors || [];
  return colors.length === 0 || colors.some(colorInStock);
}

// The first colour that can be bought, else the first colour (so the page still shows something)
export function firstInStockColor(product) {
  const colors = product?.colors || [];
  return colors.find(colorInStock) ?? colors[0] ?? null;
}

// Can this product be bought in this colour? A colour the product no longer lists falls back
// to the whole-product switch, so renaming a colour doesn't strand carts that hold the old name.
export function itemInStock(product, colorName) {
  if (!product || product.availability === false) return false;
  const colors = product.colors || [];
  if (!colorName) return productInStock(product);
  const color = colors.find((c) => sameName(c.name, colorName));
  return color ? colorInStock(color) : true;
}

// Names of the colours that are sold out
export const soldOutColorNames = (product) =>
  (product?.colors || []).filter((c) => !colorInStock(c)).map((c) => c.name);
