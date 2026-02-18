// app/admin/products/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductForm from "../ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ color: "#444", fontSize: "13px" }}>Loading product...</div>;
  }

  if (!product || product.message) {
    return <div style={{ color: "#e86a6a", fontSize: "13px" }}>Product not found.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <Link href="/admin/products" style={{ fontSize: "11px", color: "#555", textDecoration: "none", letterSpacing: "0.1em" }}>← BACK TO PRODUCTS</Link>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Products</div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>
              Edit: <span style={{ color: "#888" }}>{product.name}</span>
            </h1>
          </div>
          <a href={`/products/${id}`} target="_blank" rel="noreferrer"
            style={{ fontSize: "11px", color: "#555", textDecoration: "none", letterSpacing: "0.1em", padding: "6px 12px", border: "1px solid #222", borderRadius: "4px" }}>
            VIEW LIVE ↗
          </a>
        </div>
      </div>
      <ProductForm initial={product} isEdit />
    </div>
  );
}