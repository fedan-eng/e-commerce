"use client";
// components/category/CategoryShop.jsx
// Chips + filter sidebar + product grid. The URL query string is the source of truth.
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filterProducts, selectedFromParams, selectedToQuery } from "@/lib/categories";
import CategoryChips from "./CategoryChips";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "./ProductGrid";

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

  const applyFilters = (next) => {
    const qs = selectedToQuery(next);
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
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
        <ProductGrid products={filtered} category={category} />
      </div>
    </section>
  );
}
