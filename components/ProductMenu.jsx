"use client";
// components/ProductMenu.jsx — the "All Products" pill + dropdown in the desktop navbar.
// Category colours/images come from lib/categories.js, same as the category pages.
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/categories";
import { useHoverMenu } from "@/hooks/useHoverMenu";

const categories = STORE_CATEGORIES;

export default function ProductMenu() {
  const { open, bind } = useHoverMenu();
  const pathname = usePathname();
  const onCategoryPage = pathname === "/products" || categories.some((c) => pathname === `/products/${c.slug}`);

  return (
    <li className="relative" {...bind}>
      <Link
        href="/products/power-banks"
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-[#0A321B] transition-colors ${
          open || onCategoryPage ? "bg-[#D4EEDC]" : "bg-[#E8F5EC] hover:bg-[#D4EEDC]"
        }`}
      >
        All Products
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            // pt-3 is an invisible bridge between the pill and the card so hover isn't lost
            className="absolute left-1/2 top-full z-[60] -translate-x-1/2 pt-3"
          >
            <div className="w-[600px] rounded-[24px] border border-[#E3EDE6] bg-white p-3 shadow-[0_24px_48px_-16px_rgba(10,50,27,0.22)]">
              <ul className="grid grid-cols-2 gap-1">
                {categories.map((c) => {
                  const active = pathname === `/products/${c.slug}`;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/products/${c.slug}`}
                        className={`group/item flex items-center gap-3 rounded-[16px] p-2.5 transition-colors hover:bg-[#F3F7F2] ${
                          active ? "bg-[#F3F7F2]" : ""
                        }`}
                      >
                        <span
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px]"
                          style={{ backgroundColor: c.theme.exploreBg }}
                        >
                          <Image
                            src={c.exploreImage}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-contain p-1.5 transition-transform duration-300 group-hover/item:scale-110"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 text-[14px] font-bold text-[#0A321B]">
                            {c.title}
                            <ArrowUpRight
                              size={14}
                              className="opacity-0 transition-opacity group-hover/item:opacity-100"
                            />
                          </span>
                          <span className="mt-0.5 line-clamp-2 text-[12px] font-normal leading-snug text-[#5B6B61]">
                            {c.menuText}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}

                {/* Sixth cell: everything */}
                <li>
                  <Link
                    href="/products/power-banks"
                    className="group/all flex h-full items-center justify-between gap-3 rounded-[16px] bg-[#004328] p-4 text-white transition-colors hover:bg-[#0A321B]"
                  >
                    <span>
                      <span className="block text-[14px] font-bold">Shop all products</span>
                      <span className="mt-0.5 block text-[12px] font-normal text-white/70">
                        Every FIL gadget in one place
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform group-hover/all:translate-x-0.5">
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
