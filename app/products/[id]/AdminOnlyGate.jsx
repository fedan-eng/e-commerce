"use client";

// Admin-only products (models/Product.js): the page is cached for everyone, so who may see it is
// decided here from the signed-in user. Checkout refuses the product for non-admins anyway (lib/pricing.js).
import Link from "next/link";
import { useSelector } from "react-redux";

export default function AdminOnlyGate({ children }) {
  const { user, authChecked } = useSelector((s) => s.auth);

  if (!authChecked) return <div className="min-h-[60vh]" />;
  if (user?.role === "admin") return children;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold">Product not found</h1>
      <p className="text-sm text-gray-500">This product isn&apos;t available.</p>
      <Link href="/" className="text-sm font-medium underline">Back to the store</Link>
    </div>
  );
}
