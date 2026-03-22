//app/admin/products/[id]/page.jsx
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
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); });
  }, [id]);
 
  if (loading) return <div className="text-[#444] text-[13px]">Loading product...</div>;
  if (!product || product.message) return <div className="text-[#e86a6a] text-[13px]">Product not found.</div>;
 
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="text-[11px] text-[#555] no-underline tracking-[0.1em] hover:text-[#888] transition-colors">
          ← BACK TO PRODUCTS
        </Link>
        <div className="mt-4 flex flex-wrap justify-between items-end gap-2.5">
          <div>
            <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Products</div>
            <h1 className="m-0 text-[24px] font-bold text-[#e8e8e8] tracking-tight">
              Edit: <span className="text-[#888]">{product.name}</span>
            </h1>
          </div>
          <a href={`/products/${id}`} target="_blank" rel="noreferrer"
            className="text-[11px] text-[#555] no-underline tracking-[0.1em] px-3 py-1.5 border border-[#222] rounded hover:border-[#444] hover:text-[#888] transition-all whitespace-nowrap">
            VIEW LIVE ↗
          </a>
        </div>
      </div>
      <ProductForm initial={product} isEdit />
    </div>
  );
}
