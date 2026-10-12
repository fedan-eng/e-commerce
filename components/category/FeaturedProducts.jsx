"use client";
// components/category/FeaturedProducts.jsx — "What everyone's carrying"
import { useState } from "react";
import CategoryProductCard from "./CategoryProductCard";

const TABS = [
  { label: "All", flag: null },
  { label: "Bestsellers", flag: "isBestseller" },
  { label: "New in", flag: "isWhatsNew" },
];

export default function FeaturedProducts({ category, products }) {
  const [tab, setTab] = useState(TABS[0]);

  // "All" here = anything flagged as bestseller or new
  const highlighted = products.filter((p) => p.isBestseller || p.isWhatsNew);
  const featured = tab.flag ? highlighted.filter((p) => p[tab.flag]) : highlighted;

  if (!highlighted.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-16">
      {/* TODO: design */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">What everyone&apos;s carrying</h2>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            Our most-loved gear right now. Hover a product to see it out in the world.
          </p>
        </div>
        <div className="flex rounded-full border p-1">
          {TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-xs ${tab.label === t.label ? "bg-[#004328] text-white" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto">
        {featured.map((p) => (
          <div key={p._id} className="w-[300px] shrink-0">
            <CategoryProductCard product={p} accent={category.accent} variant="featured" />
          </div>
        ))}
      </div>
    </section>
  );
}
