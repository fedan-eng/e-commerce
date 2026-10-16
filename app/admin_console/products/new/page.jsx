//app/admin_console/products/new/page.jsx
"use client";
import Link from "next/link";
import ProductForm from "../ProductForm";
 
export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin_console/products" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-pine no-underline bg-white border border-line rounded-full px-3.5 py-1.5 hover:bg-mint transition-colors">
          ← Back to products
        </Link>
        <div className="mt-4">
          <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Products</div>
          <h1 className="m-0 text-[28px] font-poppins font-bold text-pine leading-tight">Add New Product</h1>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}