// app/admin/products/new/page.jsx
"use client";
import Link from "next/link";
import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <Link href="/admin/products" style={{ fontSize: "11px", color: "#555", textDecoration: "none", letterSpacing: "0.1em" }}>← BACK TO PRODUCTS</Link>
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Products</div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>Add New Product</h1>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}