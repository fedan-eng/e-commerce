"use client";
// components/ProductMenu.jsx — "Product" dropdown in the desktop navbar.
// Category tiles share their colours/images with the category pages (lib/categories.js).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const categories = Object.values(CATEGORIES);

export default function ProductMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const pathname = usePathname();

  // Small delay so moving the cursor from the link down into the panel doesn't close it
  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <li onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <Link
        href="/products"
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1 transition-colors hover:text-filgreen ${open ? "text-filgreen" : ""}`}
      >
        Product
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full z-[60] w-full border-t border-[#E3EDE6] bg-white shadow-[0_24px_40px_-20px_rgba(10,50,27,0.25)]"
          >
            <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-8">
              <div className="mb-4 flex items-end justify-between">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0A321B]/60">
                  Shop by category
                </p>
                <Link
                  href="/products"
                  className="group/all flex items-center gap-1.5 text-[13px] font-semibold text-[#0A321B] hover:text-filgreen"
                >
                  Shop all products
                  <ArrowRight size={14} className="transition-transform group-hover/all:translate-x-0.5" />
                </Link>
              </div>

              <ul className="grid grid-cols-5 gap-4">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/products/${c.slug}`}
                      className="group/tile relative flex h-[190px] flex-col overflow-hidden rounded-[22px] p-4"
                      style={{ backgroundColor: c.theme.exploreBg }}
                    >
                      <span className="relative z-10 text-[16px] font-bold leading-tight text-[#0A321B]">
                        {c.title}
                      </span>
                      <span className="relative z-10 mt-1 max-w-[85%] text-[11.5px] leading-snug text-[#0A321B]/70">
                        {c.menuText}
                      </span>
                      <Image
                        src={c.exploreImage}
                        alt=""
                        fill
                        sizes="240px"
                        className="object-contain object-right-bottom pl-12 pt-16 transition-transform duration-500 group-hover/tile:scale-105"
                      />
                      <span className="absolute bottom-3.5 left-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#0A321B] transition-transform group-hover/tile:scale-110">
                        <ArrowUpRight size={15} strokeWidth={2.5} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
