"use client";
// components/category/Pagination.jsx — ← 1 2 3 … 19 → (category grid, product reviews)
import { ArrowLeft, ArrowRight } from "lucide-react";

// Always shows first, last and the pages around the current one; gaps become "…"
export function getPageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const shown = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => shown.add(n));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((n) => shown.add(n));

  const pages = [...shown].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  return pages.flatMap((n, i) => (i > 0 && n - pages[i - 1] > 1 ? ["…", n] : [n]));
}

export default function Pagination({ page, totalPages, onChange, className = "mt-8" }) {
  if (totalPages <= 1) return null;

  const arrow = "flex h-10 w-10 items-center justify-center rounded-full text-forest transition-opacity disabled:opacity-30";

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page" className={arrow}>
        <ArrowLeft size={18} />
      </button>

      {getPageItems(page, totalPages).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="w-5 text-center text-sm text-muted">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`h-10 min-w-10 rounded-full px-2 text-[15px] font-semibold transition-colors ${
              item === page ? "bg-forest text-white" : "text-forest hover:bg-sage"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page" className={arrow}>
        <ArrowRight size={18} />
      </button>
    </nav>
  );
}
