// components/ConditionalShell.jsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoPopup from "@/components/PromoPopup";
import MinimumLoader from "@/components/MinimumLoader";

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin_console");

  // The admin console brings its own full-width shell; the store's wrapper
  // (overflow-x-hidden) would also stop its sticky sidebar and top bar working.
  if (isAdmin) return children;

  return (
    <>
      <Navbar />
       <div className="mx-auto w-full max-w-[1640px] overflow-x-hidden font-roboto">
      {children}
       </div>
      <Footer />
      <PromoPopup />
      <MinimumLoader />
    </>
  );
}