"use client";
import React from "react";
import { useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import {
  getFilteredProducts,
  setSort,
  setFilters,
  removeFilterTag,
  clearFilters,
} from "@/store/features/productSlice";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Loading";
import ProductFilter from "@/components/ProductFilter";
import { formatAmount } from "lib/utils";
import AddToCartButton from "@/components/AddToCart";
import WishlistButton from "@/components/WishlistButton";
import { MdNavigateNext } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import RecentlyViewed from "./RecentlyViewed";
import FAQ from "./FAQ";

// Inner component that uses useSearchParams (must be inside Suspense)
function ProductListInner() {
  const [loading, setLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isLargeScreenTwo, setIsLargeScreenTwo] = useState(false);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const {
    items: products,
    status,
    sort,
    filters,
    pagination,
  } = useSelector((state) => state.products);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const limit = 10;

  // ── Sync URL params → Redux filters on mount ──────────────────────────────
  useEffect(() => {
    const urlSearch     = searchParams.get("search") || "";
    const urlCategories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const urlSpecials   = searchParams.get("specials")?.split(",").filter(Boolean) || [];

    // Only update if URL has something meaningful
    if (urlSearch || urlCategories.length || urlSpecials.length) {
      dispatch(setFilters({
        ...(urlSearch     && { search: urlSearch }),
        ...(urlCategories.length && { categories: urlCategories }),
        ...(urlSpecials.length   && { specials: urlSpecials }),
      }));
    }
  // Run once on mount — intentionally empty dep array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
      setIsLargeScreenTwo(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(
      getFilteredProducts({
        ...filters,
        page,
        limit,
        sort: filters.sort || "default",
      })
    );
  }, [dispatch, page, limit, filters]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    filters.categories,
    filters.specials,
    filters.features,
    filters.availability,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.search,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const getSortedProducts = () => {
    if (sortBy === "lowToHigh") return [...products].sort((a, b) => a.price - b.price);
    if (sortBy === "highToLow") return [...products].sort((a, b) => b.price - a.price);
    return products;
  };

  const totalPages = pagination?.totalPages || 1;
  const isSearching = !!filters.search;

  if (status === "pending") {
    return (
      <div className="flex justify-center items-center py-10 w-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-center lg:gap-4 mx-2 mt-6">
        {isLargeScreenTwo && <ProductFilter />}
        <div className="">

          {/* ── Search results header ── */}
          {isSearching && (
            <div className="mb-4 pb-4 border-b border-[#eaeaea]">
              <p className="text-sm text-[#3e3e3e]">
                Showing results for{" "}
                <span className="font-medium text-black">"{filters.search}"</span>
                {" "}— {pagination?.total || 0} product{pagination?.total !== 1 ? "s" : ""} found
              </p>
              <button
                onClick={() => dispatch(setFilters({ search: "" }))}
                className="mt-1 text-xs text-[#007c42] hover:underline"
              >
                ✕ Clear search
              </button>
            </div>
          )}

          {/* Product Grid header */}
          <div className="flex justify-between items-center py-2 border-[#eaeaea] border-b">
            <div>
              <p className="text-[#3e3e3e] text-xs">
                {pagination?.total || 0} products
              </p>
              {!isLargeScreenTwo && <ProductFilter />}
            </div>
            <div>
              <select
                value={sort}
                onChange={(e) => dispatch(setSort(e.target.value))}
                className="p-2 px-[10px] border border-[#d9d9d9] rounded-md outline-0 text-[#1c1b1f] text-xs"
              >
                <option value="default">Sort By Default</option>
                <option value="price-low-high">Sort Lowest to Highest</option>
                <option value="price-high-low">Sort Highest to Lowest</option>
              </select>
            </div>
          </div>

          {/* Active filter tags */}
          <div>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mt-2">
                {filters?.categories?.map((cat) => (
                  <span key={cat} className="flex items-center gap-2 px-2 py-2 border border-[#007c42] rounded-2xl text-[#007c42] text-sm cursor-pointer"
                    onClick={() => dispatch(removeFilterTag({ type: "categories", value: cat }))}>
                    {cat} <p>✕</p>
                  </span>
                ))}
                {filters?.specials?.map((special) => (
                  <span key={special} className="flex justify-center items-center gap-2 px-2 py-2 border border-[#007c42] rounded-2xl text-[#007c42] text-sm cursor-pointer"
                    onClick={() => dispatch(removeFilterTag({ type: "specials", value: special }))}>
                    {special === "isBestseller" && "Best Seller"}
                    {special === "isWhatsNew" && "What's New"}
                    {special === "isTodaysDeal" && "Today's Deal"} <p>✕</p>
                  </span>
                ))}
                {(filters?.categories?.length > 0 || filters?.specials?.length > 0) && (
                  <button onClick={() => dispatch(clearFilters())}
                    className="flex items-center px-2 py-2 border border-[#007c42] rounded-2xl text-[#007c42] text-xs cursor-pointer">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* No results state */}
          {getSortedProducts().length === 0 && status !== "pending" && (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-gray-400 text-4xl mb-3">🔍</p>
              <p className="font-medium text-base text-[#1c1b1f]">
                {isSearching ? `No results for "${filters.search}"` : "No products found"}
              </p>
              <p className="text-sm text-[#767676] mt-1 mb-4">
                {isSearching ? "Try a different search term or browse our categories below." : "Try adjusting your filters."}
              </p>
              <button
                onClick={() => dispatch(isSearching ? setFilters({ search: "" }) : clearFilters())}
                className="px-4 py-2 bg-black text-white text-xs rounded-md hover:bg-[#333] transition"
              >
                {isSearching ? "Clear search" : "Reset filters"}
              </button>
            </div>
          )}

          {/* Product grid */}
          <div className="flex flex-wrap justify-center lg:justify-items-center gap-2 md:gap-4 lg:gap-y-4 lg:grid grid-cols-[minmax(273px,1fr)_minmax(273px,1fr)_minmax(273px,1fr)] w-full max-w-[851px]">
            {getSortedProducts()?.map((product, index) => (
              <React.Fragment key={product._id}>
                <div className="relative flex flex-col justify-between bg-[#f6f6f6] rounded-md w-[45%] box:w-[273px] mid:w-[240px] s:w-[46%] sm:w-[273px] md:h-[351px]">
                  <Link className="relative" href={`/products/${product._id}`}>
                    <div className="xs:top-4 relative flex justify-between items-center xs:mr-4">
                      {product.tag && (
                        <div className="z-30 relative">
                          {product.tag === "fast" && (<><img src="/redtag.png" alt="Fast tag" /><span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">Selling fast</span></>)}
                          {product.tag === "new" && (<><img src="/blacktag.png" alt="New tag" /><span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">New</span></>)}
                          {product.tag === "discount" && (<><img src="/bluetag.png" alt="Discount tag" /><span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span></>)}
                          {product.tag === "hurry" && (<><img src="/orangetag.png" alt="Hurry tag" /><span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">Hurry 2 Left</span></>)}
                        </div>
                      )}
                      {!product.tag && <div></div>}
                      <WishlistButton className="relative" product={product} />
                    </div>

                    <div className="relative mx-auto px-5 sm:px-10 w-[80px] s:w-[100px] sm:w-[150px] max-w-[300px] cat:max-w-[241px] h-[100px] s:h-[150px] sm:h-[200px]">
                      <Image src={product.image} alt={product.name} fill className="absolute mx-auto w-full h-full object-contain" />
                    </div>

                    <div className="z-20 mt-5 sm:mt-[5px]">
                      <div className="flex justify-between px-[10px] sm:px-4">
                        <p className="font-normal text-[#767676] text-xs sm:text-xs">{product.category || "Uncategorized"}</p>
                        <div className="flex gap-0.5">
                          <img src="/star.png" alt="Star" />
                          <p className="text-[#1c1b1f] text-[10px] sm:text-xs">{product.averageRating}</p>
                          <p className="text-[#1c1b1f] text-[10px] sm:text-xs">({product.ratingsCount || 0})</p>
                        </div>
                      </div>

                      <h3 className="mt-2 px-[10px] sm:px-4 font-oswald font-medium text-base text-ellipsis line-clamp-1">{product.name}</h3>

                      {isLargeScreen && (
                        <div className="relative mx-4 mt-8 pb-4 sm:pb-6 h-[40px]">
                          <span className="flex gap-3">
                            <p className="font-medium text-[#1c1b1f] text-base">{formatAmount(product.price)}</p>
                            {product.originalPrice > 0 && <p className="text-[#767676] text-base line-through">{formatAmount(product.originalPrice)}</p>}
                          </span>
                          <div className="top-0 left-0 absolute opacity-0 hover:opacity-100 w-full transition-opacity duration-300">
                            <AddToCartButton className={`flex justify-center ${product.availability ? "bg-black" : "bg-gray-300 cursor-not-allowed"} py-2 rounded-md w-full text-white text-xs text-center`} product={product} />
                          </div>
                        </div>
                      )}

                      {!isLargeScreen && (
                        <div className="relative mt-4 px-[10px] sm:px-4 pb-4 sm:pb-6">
                          <span className="flex gap-1 xs:gap-3">
                            <p className="font-medium text-[#1c1b1f] text-xs xs:text-base">{formatAmount(product.price)}</p>
                            {product.originalPrice > 0 && <p className="text-[#767676] text-xs xs:text-base line-through">{formatAmount(product.originalPrice)}</p>}
                          </span>
                          <div className="mt-4 w-full">
                            <AddToCartButton className={`flex justify-center ${product.availability ? "bg-black" : "bg-gray-300 cursor-not-allowed"} py-2 rounded-md w-full text-white text-xs text-center`} product={product} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                {index === 1 && !isSearching && (
                  <div className="relative flex flex-col justify-between bg-[#f6f6f6] rounded-md w-[45%] box:w-[273px] mid:w-[240px] s:w-[46%] sm:w-[273px] h-[298px] s:h-[348px] sm:h-[391px] md:h-[351px]">
                    <img src="/ads-banner.png" alt="Special Offer" className="rounded-md w-full h-full object-cover" />
                  </div>
                )}
                {index === 6 && !isSearching && (
                  <div className="relative flex flex-col justify-between bg-[#f6f6f6] rounded-md w-[45%] box:w-[273px] mid:w-[240px] s:w-[46%] sm:w-[273px] h-[298px] s:h-[348px] sm:h-[391px] md:h-[351px]">
                    <img src="/ads-banner2.png" alt="Special Offer" className="rounded-md w-full h-full object-cover" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-nowrap justify-center items-center gap-1 xs:gap-3 mx-auto mt-4 w-full max-w-[400px]">
            <button disabled={page <= 2} onClick={() => setPage((prev) => Math.max(1, prev - 2))}
              className="enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded-md whitespace-nowrap rotate-180 cursor-pointer disabled:cursor-default shrink-0">
              <MdKeyboardDoubleArrowRight />
            </button>
            <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}
              className="max-xs:hidden enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded rotate-180 cursor-pointer disabled:cursor-default shrink-0">
              <MdNavigateNext />
            </button>

            <div className="flex flex-nowrap items-center gap-2 shrink">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((num) => num === 1 || num === totalPages || num === page || num === page - 1 || num === page + 1)
                .reduce((acc, num, idx, arr) => {
                  if (idx > 0 && num - arr[idx - 1] > 1) acc.push("ellipsis");
                  acc.push(num);
                  return acc;
                }, [])
                .map((item, index) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                  ) : (
                    <button key={item} onClick={() => setPage(item)}
                      className={`px-[6px] s:px-[14px] py-2 text-xs rounded-md shrink-0 ${page === item ? "bg-black text-white" : "hover:bg-[#e7e7e7] cursor-pointer"}`}>
                      {item}
                    </button>
                  )
                )}
            </div>

            <button disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}
              className="max-xs:hidden enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded cursor-pointer disabled:cursor-default shrink-0">
              <MdNavigateNext />
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((prev) => Math.min(totalPages, prev + 2))}
              className="enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded cursor-pointer disabled:cursor-default shrink-0">
              <MdKeyboardDoubleArrowRight />
            </button>
          </div>
        </div>
      </div>

      <RecentlyViewed />

      <div className="flex justify-center items-center gap-2 mx-auto mt-20 px-3">
        <div className="w-full nav:min-w-[400px] max-w-[600px]">
          <h2 className="mb-6 font-oswald font-medium text-2xl xxs:text-4xl">Get 10% Off Your First Order</h2>
          <div>
            <h3 className="mb-3 font-medium">Steps to saving:</h3>
            <div className="flex gap-2">
              <Image height={24} width={24} src="/tick.png" alt="tick" className="w-6 h-6" />
              <p>Sign up and gain exclusive access to emails from us</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Image height={24} width={24} src="/tick.png" alt="tick" className="w-6 h-6" />
              <p>Receive an email with your 20% discount code</p>
            </div>
            <div className="flex items-end gap-2 md:gap-4 rounded-md w-full">
              <div className="mt-6 w-full max-w-[600px] nav:max-w-[339px]">
                <input type="text" name="track" id="track" placeholder="Order number"
                  className="bg-[#f7f7f7] p-4 rounded-md outline-0 w-full placeholder-text-[#3e3e3e] text-sm" />
              </div>
              <button className={loading ? "" : "block bg-filgreen whitespace-nowrap px-3 sm:px-6 py-4 rounded-md text-dark font-medium text-sm shadow-button"}>
                {loading ? <Loading /> : "Get started"}
              </button>
            </div>
          </div>
        </div>
        <div className="max-nav:hidden border-[6px] border-black rounded-md w-full max-w-[561px]">
          <div className="w-full max-w-[561px] h-[268px]">
            <img className="w-full h-full object-contain" src="/tag.png" alt="" />
          </div>
        </div>
      </div>
      <FAQ />
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it in Next.js
export default function ProductList() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-10 w-full"><Loading /></div>}>
      <ProductListInner />
    </Suspense>
  );
}