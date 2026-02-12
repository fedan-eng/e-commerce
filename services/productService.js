// services/productService.js

//GET ALL PRODUCTS
export const fetchAllProducts = async () => {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

//GET PRODUCT
export const fetchProductById = async (id) => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
};

//CREATE PRODUCT
export const createProduct = async (productData) => {
  const res = await fetch("/api/products", {
    method: "POST",
    body: JSON.stringify(productData),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
};

//UPDATE PRODUCT
export const updateProduct = async (id, updates) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
};

//DELETE PRODUCT
export const deleteProduct = async (id) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
};
