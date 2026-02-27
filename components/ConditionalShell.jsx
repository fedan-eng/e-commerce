// components/ConditionalShell.jsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render Navbar/Footer until client-side
  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-[1640px] overflow-x-hidden font-roboto">
        {children}
      </div>
    );
  }

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