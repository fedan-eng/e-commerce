"use client";
// components/category/CategoryShop.jsx
// Chips + filter sidebar + product grid. The URL query string is the source of truth.
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filterProducts, selectedFromParams, selectedToQuery } from "@/lib/categories";
import CategoryChips from "./CategoryChips";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";

// 3×3 grid: 8 products + the help card
const PER_PAGE = 8;

export default function CategoryShop({ category, products }) {
  const router = useRouter();
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // ?page=N — clamped so a stale link can't land on an empty page
  const page = Math.min(Math.max(1, parseInt(searchParams.get("page")) || 1), totalPages);
  const pageProducts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // New filters always start from page 1 (page isn't carried over)
  const applyFilters = (next) => {
    const qs = selectedToQuery(next);
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const goToPage = (n) => {
    const params = new URLSearchParams(searchParams.toString());
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="shop" className="mx-auto max-w-[1440px] px-4 py-8 md:px-16">
      <CategoryChips chips={category.chips} selected={selected} onSelect={applyFilters} />
      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <FilterSidebar
          filters={category.filters.filter((f) => !f.hidden)}
          selected={selected}
          onApply={applyFilters}
        />
        <div className="flex-1">
          <ProductGrid products={pageProducts} category={category} />
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </div>
      </div>
    </section>
  );
}
