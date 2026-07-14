"use client";
import Image from "next/image";
import Link from "next/link";
import {motion, AnimatePresence} from "framer-motion";
import {Search, X as XIcon} from "lucide-react";
import {IoMdSearch} from "react-icons/io";
import {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import {formatAmount} from "@/lib/utils";
import {useGAEvent} from "@/hooks/useGAEvent";
import {useTikTokEvent} from "@/hooks/useTikTokEvent";

const categories = [
  {name: "Power Banks", image: "/powerbanks.png", link: "/products?categories=Power Bank"},
  {name: "Wearables", image: "/wearables.png", link: "/products?categories=Wearables"},
  {name: "Chargers", image: "/chargers.png", link: "/products?categories=Chargers"},
  {name: "Lifestyle", image: "/lifestyle.png", link: "/products?categories=Lifestyle"},
  {name: "Extensions", image: "/extensions.png", link: "/products?categories=Extensions"},
];

const TOP_SUGGESTIONS = [
  {name: "FIL Bolt Pro 32,500 mAh Power Bank", href: "/products/691b041af0ddc5e1e75e1ed0"},
  {name: "FIL Pulse 3", href: "/products/691b18d96ab12366ceef60e4"},
  {name: "FIL Mag-Flex 10,000mAh Powerbank", href: "/products/691b18d96ab12366ceef60dc"},
];

const NavSearchTooltip = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();
  const { trackSearch } = useTikTokEvent();
  const { trackEvent } = useGAEvent();

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/products?search=${encodeURIComponent(searchTerm.trim())}`,
        );
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
    
    // Track TikTok Search event
    trackSearch(term, results.length);
    
     // Track Google Analytics Search event
    trackEvent('search', { search_term: term });
    
    setOpen(false);
    setSearchTerm("");
    setResults([]);
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      handleViewAll();
    }
  };

  return (
    <li
  ref={containerRef}
  className="flex justify-center items-center relative"
  onMouseLeave={() => {
    // Don't close if user is actively typing in the search input
    const activeEl = document.activeElement;
    const isTypingInSearch =
      activeEl &&
      containerRef.current?.contains(activeEl) &&
      activeEl.tagName === "INPUT";
    if (!isTypingInSearch) setOpen(false);
  }}
>
      {/* ── Desktop trigger: icon + label ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="hidden nav:flex items-center gap-1.5 text-[#1a1a1a] hover:text-filgreen transition-colors"
      >
        <Search size={18} strokeWidth={1.75} />
        <span className="font-roboto text-sm">Search</span>
      </button>

      {/* ── Mobile icon ── */}
      <button
        className="nav:hidden flex items-center text-[#1a1a1a]"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search"
      >
        <Search size={22} strokeWidth={1.75} />
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.18}}
            className="sm:top-12 sm:right-0 sm:absolute z-50 bg-white sm:rounded-lg shadow-2xl border border-[#e5e5e5] sm:w-[580px] max-sm:fixed max-sm:top-[68px] max-sm:left-0 max-sm:w-full max-sm:max-h-[80vh] max-sm:overflow-y-auto"
          >
            <div className="flex max-sm:flex-col gap-5 p-5">
              {/* LEFT */}
              <div className="flex-shrink-0 sm:w-[260px]">
                <p className="hidden sm:block mb-4 font-oswald text-sm uppercase tracking-wide text-[#1a1a1a]">
                  FIL Categories
                </p>
                <p className="sm:hidden block mb-4 font-oswald text-sm uppercase tracking-wide text-[#1a1a1a]">
                  Search Product
                </p>

                {/* Desktop search input above categories */}
                <div className="hidden sm:flex items-center gap-2 mb-3 bg-[#f7f7f7] px-3 py-2.5 border border-[#e5e5e5] rounded-full focus-within:border-filgreen transition-colors">
                  <Search className="text-[#929292] flex-shrink-0" size={14} />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="block outline-0 w-full bg-transparent text-sm placeholder-[#929292]"
                    autoFocus
                  />
                  {hasSearch && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setResults([]);
                      }}
                      className="text-[#929292] hover:text-black flex-shrink-0"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>

                {/* Category grid */}
                <div className="hidden sm:grid gap-2 grid-cols-2">
                  {categories.map((cat, i) => (
                    <Link
                      href={cat.link}
                      key={i}
                      onClick={() => {
                        setOpen(false);
                        setSearchTerm("");
                      }}
                      className="flex bg-[#f2f2f2] rounded-md overflow-hidden hover:bg-[#e8e8e8] transition-colors"
                    >
                      <span className="pt-2 pl-2 font-oswald text-xs uppercase">
                        {cat.name}
                      </span>
                      <div className="ml-auto">
                        <Image
                          width={60}
                          height={60}
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Mobile search input */}
                <div className="sm:hidden flex items-center gap-2 bg-[#f7f7f7] px-3 py-2.5 border border-[#e5e5e5] rounded-full">
                  <Search className="text-[#929292] flex-shrink-0" size={16} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="block outline-0 w-full bg-transparent text-sm placeholder-[#929292]"
                    autoFocus
                  />
                  {hasSearch && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setResults([]);
                      }}
                      className="text-gray-400"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="sm:px-4 sm:border-[#dfdfdf] sm:border-l flex-1 min-w-0">
                {loading && (
                  <div className="flex items-center gap-2 py-6 text-gray-400 text-sm">
                    <div className="w-3 h-3 border border-gray-300 border-t-black rounded-full animate-spin" />
                    Searching...
                  </div>
                )}

                {!loading && hasSearch && hasResults && (
                  <>
                    <p className="mb-3 font-oswald text-sm uppercase tracking-wide">
                      Results{" "}
                      <span className="text-[#929292] normal-case font-sans text-xs">
                        for "{searchTerm}"
                      </span>
                    </p>
                    <div>
                      {results.map((product) => (
                        <Link
                          href={`/products/${product._id}`}
                          key={product._id}
                          onClick={() => {
                            setOpen(false);
                            setSearchTerm("");
                            setResults([]);
                          }}
                          className="flex items-center gap-3 hover:bg-gray-50 px-1 py-2 rounded-md transition-colors group"
                        >
                          <div className="w-9 h-9 flex-shrink-0 rounded overflow-hidden bg-[#f5f5f5] border border-[#e5e5e5]">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                □
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm line-clamp-1 group-hover:underline">
                              {product.name}
                            </p>
                            {product.price && (
                              <p className="text-xs text-[#929292]">
                                {formatAmount(product.price)}
                              </p>
                            )}
                          </div>
                          <IoMdSearch className="text-gray-300 text-sm flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleViewAll}
                      className="flex items-center gap-1 mt-3 pt-3 border-t border-[#f0f0f0] text-xs text-filgreen hover:underline w-full"
                    >
                      View all results for "{searchTerm}" →
                    </button>
                  </>
                )}

                {!loading && hasSearch && !hasResults && (
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-500">No products found for</p>
                    <p className="text-sm font-medium">"{searchTerm}"</p>
                    <Link
                      href="/products"
                      onClick={() => {
                        setOpen(false);
                        setSearchTerm("");
                      }}
                      className="mt-3 inline-block text-xs text-filgreen hover:underline"
                    >
                      Browse all products →
                    </Link>
                  </div>
                )}

                {!hasSearch && !loading && (
                  <>
                    <p className="mb-4 font-oswald text-sm uppercase tracking-wide">
                      Top Suggestions
                    </p>
                    <div>
                      {TOP_SUGGESTIONS.map((s, i) => (
                        <Link
                          href={s.href}
                          key={i}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 hover:bg-gray-50 px-1 py-2 rounded-md transition-colors"
                        >
                          <Search className="text-black flex-shrink-0" size={14} />
                          <p className="text-sm underline line-clamp-1">{s.name}</p>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default NavSearchTooltip;