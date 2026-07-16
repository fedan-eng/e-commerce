// components/ConditionalShell.jsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin_console");

  return (
    <>
      {!isAdmin && <Navbar />}
       <div className="mx-auto w-full max-w-[1640px] overflow-x-hidden font-roboto">
      {children}
       </div>
      {!isAdmin && <Footer />}
    </>
  );
}