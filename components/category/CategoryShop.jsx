"use client";
// components/category/CategoryShop.jsx
// Chips + filter sidebar + product grid. The URL query string is the source of truth.
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { filterProducts, selectedFromParams, selectedToQuery } from "@/lib/categories";
import CategoryChips from "./CategoryChips";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";

// 3×3 grid: 8 products + the help card
const PER_PAGE = 8;

export default function CategoryShop({ category, products }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = useMemo(
    () => selectedFromParams(category, searchParams),
    [category, searchParams]
  );

  const filtered = useMemo(
    () => filterProducts(products, category, selected),
    [products, category, selected]
  );

  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = Object.values(selected).reduce((n, ids) => n + ids.length, 0);
  const sidebarFilters = category.filters.filter((f) => !f.hidden);

  // Lock page scroll while the mobile filter sheet is open
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // ?page=N — clamped so a stale link can't land on an empty page
  const page = Math.min(Math.max(1, parseInt(searchParams.get("page")) || 1), totalPages);
  const pageProducts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Filtering happens in the browser, so update the URL with the History API
  // (Next keeps useSearchParams in sync) — instant, no server round trip.
  const setQuery = (qs, { replace = false } = {}) => {
    const url = qs ? `${pathname}?${qs}` : pathname;
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
  };

  // New filters always start from page 1 (page isn't carried over).
  // live = a checkbox tick: replace the history entry so Back doesn't step through every tick.
  const applyFilters = (next, { live = false } = {}) => {
    setQuery(selectedToQuery(next), { replace: live });
  };

  const goToPage = (n) => {
    const params = new URLSearchParams(searchParams.toString());
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    setQuery(params.toString());
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="shop" className="mx-auto max-w-[1440px] px-4 py-8 md:px-16">
      <div className="flex items-center gap-2">
        {/* Mobile: filters live in a bottom sheet so products show straight away */}
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#004328] bg-white px-3.5 py-2 text-xs font-semibold text-[#004328] md:hidden"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeCount > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1FA34A] px-1 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <CategoryChips chips={category.chips} selected={selected} onSelect={applyFilters} theme={category.theme} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <div className="hidden md:block">
          <FilterSidebar filters={sidebarFilters} selected={selected} onApply={applyFilters} />
        </div>
        <div className="flex-1">
          <ProductGrid products={pageProducts} category={category} />
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-[#0A321B]/35 md:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-0 bottom-0 z-[201] flex max-h-[85vh] flex-col rounded-t-[28px] bg-white md:hidden"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#EEF3EF] px-5 pb-3 pt-5">
                <h2 className="text-[18px] font-bold text-[#0A321B]">Filters</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7F2] text-[#0A321B]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
                <FilterSidebar
                  filters={sidebarFilters}
                  selected={selected}
                  onApply={applyFilters}
                  applyLabel={`Show ${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
                  onDone={() => setFiltersOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
