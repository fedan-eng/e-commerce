"use client";
// components/NavSearchTooltip.jsx — navbar search.
// Desktop: a card under the "Search" trigger. Mobile: a panel that drops from the top of the screen.
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X as XIcon, ArrowRight, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { formatAmount } from "@/lib/utils";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { ProductImage } from "@/components/ProductImage";
import { CATEGORIES } from "@/lib/categories";

const categories = Object.values(CATEGORIES);

const TOP_SUGGESTIONS = [
  { name: "FIL Bolt Pro 32,500 mAh Power Bank", href: "/products/691b041af0ddc5e1e75e1ed0" },
  { name: "FIL Pulse 3", href: "/products/691b18d96ab12366ceef60e4" },
  { name: "FIL Mag-Flex 10,000mAh Powerbank", href: "/products/691b18d96ab12366ceef60dc" },
];

const NavSearchTooltip = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { trackSearch } = useTikTokEvent();
  const { trackEvent } = useGAEvent();

  const close = () => {
    setOpen(false);
    setSearchTerm("");
    setResults([]);
  };

  // Click outside closes
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape closes; navigation closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  // Debounced live search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(searchTerm.trim())}`);
        setResults(res.data.products?.slice(0, 6) || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasSearch = searchTerm.trim().length > 0;
  const hasResults = results.length > 0;

  const handleViewAll = () => {
    const term = searchTerm.trim();
    if (!term) return;
    trackSearch(term, results.length); // TikTok
    trackEvent("search", { search_term: term }); // Google Analytics
    close();
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) handleViewAll();
  };

  return (
    <li ref={containerRef} className="relative flex items-center justify-center">
      {/* Desktop trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`hidden items-center gap-1.5 text-[#1a1a1a] transition-colors hover:text-filgreen nav:flex ${open ? "text-filgreen" : ""}`}
      >
        <Search size={18} strokeWidth={1.75} />
        <span className="text-sm">Search</span>
      </button>

      {/* Mobile trigger */}
      <button
        className="flex items-center text-[#1a1a1a] nav:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search"
        aria-expanded={open}
      >
        <Search size={22} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-[#0A321B]/30 nav:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-0 top-0 z-[71] max-h-[88vh] overflow-y-auto rounded-b-[24px] bg-white p-4 shadow-xl nav:absolute nav:inset-x-auto nav:right-0 nav:top-full nav:mt-3 nav:max-h-none nav:w-[540px] nav:overflow-visible nav:rounded-[24px] nav:border nav:border-[#E3EDE6] nav:shadow-[0_24px_48px_-16px_rgba(10,50,27,0.22)]"
            >
              {/* Input */}
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2.5 rounded-full border border-[#E3EDE6] bg-[#F3F7F2] px-4 py-3 transition-colors focus-within:border-[#1FA34A] focus-within:bg-white">
                  <Search size={16} className="shrink-0 text-[#5B6B61]" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search power banks, earbuds, chargers…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-[14px] text-[#0A321B] outline-none placeholder:text-[#8A9A90]"
                    autoFocus
                  />
                  {hasSearch && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setResults([]);
                      }}
                      aria-label="Clear search"
                      className="shrink-0 rounded-full p-0.5 text-[#5B6B61] hover:bg-[#E3EDE6] hover:text-[#0A321B]"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="shrink-0 px-1 text-[13px] font-semibold text-[#0A321B] nav:hidden"
                >
                  Cancel
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="mt-4 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex animate-pulse items-center gap-3 p-2">
                      <div className="h-12 w-12 rounded-[12px] bg-[#EEF3EF]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 rounded bg-[#EEF3EF]" />
                        <div className="h-3 w-1/4 rounded bg-[#EEF3EF]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && hasSearch && hasResults && (
                <div className="mt-4">
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B6B61]">
                    Products
                  </p>
                  <ul className="mt-1.5">
                    {results.map((product) => (
                      <li key={product._id}>
                        <Link
                          href={`/products/${product._id}`}
                          onClick={close}
                          className="group flex items-center gap-3 rounded-[14px] p-2 transition-colors hover:bg-[#F3F7F2]"
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[#F3F7F2]">
                            {product.image && (
                              <ProductImage
                                src={product.image}
                                alt=""
                                width={48}
                                height={48}
                                className="h-full w-full object-contain p-1"
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-medium text-[#0A321B]">
                              {product.name}
                            </span>
                            {product.price && (
                              <span className="text-[12.5px] font-bold text-[#1FA34A]">
                                {formatAmount(product.price)}
                              </span>
                            )}
                          </span>
                          <ArrowRight
                            size={15}
                            className="shrink-0 text-[#0A321B] opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleViewAll}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#004328] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-black"
                  >
                    View all results for “{searchTerm.trim()}”
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* No results */}
              {!loading && hasSearch && !hasResults && (
                <div className="mt-4 rounded-[16px] bg-[#F3F7F2] px-4 py-8 text-center">
                  <p className="text-[14px] font-semibold text-[#0A321B]">
                    No products found for “{searchTerm.trim()}”
                  </p>
                  <p className="mt-1 text-[12.5px] text-[#5B6B61]">Try a shorter word, or browse a category below.</p>
                </div>
              )}

              {/* Idle (or no results): suggestions + categories */}
              {!loading && (!hasSearch || !hasResults) && (
                <>
                  {!hasSearch && (
                    <div className="mt-4">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B6B61]">
                        Popular right now
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {TOP_SUGGESTIONS.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            onClick={close}
                            className="flex items-center gap-1.5 rounded-full border border-[#E3EDE6] px-3 py-1.5 text-[12.5px] font-medium text-[#0A321B] transition-colors hover:border-[#1FA34A] hover:bg-[#F3F7F2]"
                          >
                            <TrendingUp size={13} className="text-[#1FA34A]" />
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B6B61]">
                      Browse categories
                    </p>
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/products/${c.slug}`}
                          onClick={close}
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <span
                            className="relative aspect-square w-full overflow-hidden rounded-[14px]"
                            style={{ backgroundColor: c.theme.exploreBg }}
                          >
                            <Image
                              src={c.exploreImage}
                              alt=""
                              fill
                              sizes="96px"
                              className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                            />
                          </span>
                          <span className="text-center text-[11.5px] font-semibold leading-tight text-[#0A321B]">
                            {c.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </li>
  );
};

export default NavSearchTooltip;
