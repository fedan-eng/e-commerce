"use client";
// components/category/Pagination.jsx — Prev / page numbers / Next under the product grid
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-2">
      {/* TODO: design */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-9 min-w-9 rounded-full px-3 text-xs font-semibold ${
            n === page ? "bg-[#004328] text-white" : "border"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
