// app/admin_console/products/new/page.jsx
"use client";
import ProductForm from "../ProductForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Add product" description="Fill in the details, then create the product." />
      <ProductForm />
    </div>
  );
}
