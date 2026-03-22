//app/admin/products/new/page.jsx
"use client";
import Link from "next/link";
import ProductForm from "../ProductForm";
 
export function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="text-[11px] text-[#555] no-underline tracking-[0.1em] hover:text-[#888] transition-colors">
          ← BACK TO PRODUCTS
        </Link>
        <div className="mt-4">
          <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Products</div>
          <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">Add New Product</h1>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
 
export default NewProductPage;