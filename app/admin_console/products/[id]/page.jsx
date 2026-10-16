//app/admin_console/products/[id]/page.jsx
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
    fetch(`/api/products/${id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); });
  }, [id]);
 
  if (loading) return <div className="text-faint text-[13px]">Loading product...</div>;
  if (!product || product.message) return <div className="text-[#c53030] text-[13px]">Product not found.</div>;
 
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin_console/products" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-pine no-underline bg-white border border-line rounded-full px-3.5 py-1.5 hover:bg-mint transition-colors">
          ← Back to products
        </Link>
        <div className="mt-4 flex flex-wrap justify-between items-end gap-2.5">
          <div>
            <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Products</div>
            <h1 className="m-0 text-[28px] font-poppins font-bold text-pine leading-tight">
              Edit: <span className="text-muted">{product.name}</span>
            </h1>
          </div>
          <a href={`/products/${id}`} target="_blank" rel="noreferrer"
            className="text-[12px] font-semibold text-pine no-underline px-3.5 py-1.5 bg-mint rounded-full hover:bg-zest transition-colors whitespace-nowrap">
            View live ↗
          </a>
        </div>
      </div>
      <ProductForm initial={product} isEdit />
    </div>
  );
}
