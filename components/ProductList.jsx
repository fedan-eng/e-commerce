"use client";
import React from "react";
import {useEffect, useState, Suspense, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useSearchParams} from "next/navigation";
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
import {formatAmount} from "lib/utils";
import AddToCartButton from "@/components/AddToCart";
import WishlistButton from "@/components/WishlistButton";
import {MdNavigateNext} from "react-icons/md";
import {MdKeyboardDoubleArrowRight} from "react-icons/md";
import RecentlyViewed from "./RecentlyViewed";
import FAQ from "./FAQ";

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
  const limit = 10;

  // ── SEO: DYNAMIC JSON-LD SCHEMA ──
  // This helps Google show your products with prices/ratings in search results
  const jsonLd = useMemo(() => {
    if (!products || products.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: filters.categories?.[0] || "Top Tech Products in Nigeria",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          url: `https://www.filstore.com.ng/products/${product._id}`,
          name: product.name,
          image: product.image,
          description: `Buy ${product.name} at the best price on FIL Store Nigeria.`,
          brand: {"@type": "Brand", name: "FIL"},
          ...(product.averageRating > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.averageRating,
              reviewCount: product.ratingsCount,
            },
          }),
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "NGN",
            availability: product.availability
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `https://www.filstore.com.ng/products/${product._id}`,
          },
        },
      })),
    };
  }, [products, filters.categories]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const urlSpecials =
      searchParams.get("specials")?.split(",").filter(Boolean) || [];

    if (urlSearch || urlCategories.length || urlSpecials.length) {
      dispatch(
        setFilters({
          ...(urlSearch && {search: urlSearch}),
          ...(urlCategories.length && {categories: urlCategories}),
          ...(urlSpecials.length && {specials: urlSpecials}),
        }),
      );
    }
  }, [dispatch, searchParams]);

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
      }),
    );
  }, [dispatch, page, limit, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    window.scrollTo({top: 0, behavior: "smooth"});
  }, [page]);

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
      {/* SEO Script Injection */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
      )}

      <div className="flex justify-center lg:gap-4 mx-2 mt-6">
        {isLargeScreenTwo && <ProductFilter />}
        <div className="">
          {/* ── Search results header ── */}
          {isSearching && (
            <div className="mb-4 pb-4 border-b border-[#eaeaea]">
              <h1 className="text-sm text-[#3e3e3e]">
                Showing results for{" "}
                <span className="font-medium text-black">
                  "{filters.search}"
                </span>{" "}
                — {pagination?.total || 0} product
                {pagination?.total !== 1 ? "s" : ""} found
              </h1>
              <button
                onClick={() => dispatch(setFilters({search: ""}))}
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
                aria-label="Sort products"
                value={sort}
                onChange={(e) => dispatch(setSort(e.target.value))}
                className="p-2 px-[10px] border border-[#d9d9d9] rounded-md outline-0 text-[#1c1b1f] text-xs"
              >
                <option value="default">Sort By Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active filter tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mt-2">
              {filters?.categories?.map((cat) => (
                <span
                  key={cat}
                  className="flex items-center gap-2 px-2 py-2 border border-[#007c42] rounded-2xl text-[#007c42] text-sm cursor-pointer"
                  onClick={() =>
                    dispatch(removeFilterTag({type: "categories", value: cat}))
                  }
                >
                  {cat} <p>✕</p>
                </span>
              ))}
              {filters?.specials?.map((special) => (
                <span
                  key={special}
                  className="flex justify-center items-center gap-2 px-2 py-2 border border-[#007c42] rounded-2xl text-[#007c42] text-sm cursor-pointer"
                  onClick={() =>
                    dispatch(
                      removeFilterTag({type: "specials", value: special}),
                    )
                  }
                >
                  {special === "isBestseller" && "Best Seller"}
                  {special === "isWhatsNew" && "What's New"}
                  {special === "isTodaysDeal" && "Today's Deal"} <p>✕</p>
                </span>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="flex flex-wrap justify-center lg:justify-items-center gap-2 md:gap-4 lg:gap-y-4 lg:grid grid-cols-[minmax(273px,1fr)_minmax(273px,1fr)_minmax(273px,1fr)] w-full max-w-[851px]">
            {products?.map((product, index) => (
              <React.Fragment key={product._id}>
                <article className="relative flex flex-col justify-between bg-[#f6f6f6] rounded-md w-[45%] box:w-[273px] mid:w-[240px] s:w-[46%] sm:w-[273px] md:h-[351px]">
                  <Link
                    className="relative"
                    href={`/products/${product._id}`}
                    title={`View ${product.name}`}
                  >
                    <div className="xs:top-4 relative flex justify-between items-center xs:mr-4 px-2">
                      {product.tag && (
                        <div className="z-30 relative">
                          {product.tag === "fast" && (
                            <>
                              <img src="/redtag.png" alt="Selling fast" />
                              <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-[10px] -translate-y-1/2">
                                Selling fast
                              </span>
                            </>
                          )}
                          {product.tag === "new" && (
                            <>
                              <img src="/blacktag.png" alt="New Arrival" />
                              <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-[10px] -translate-y-1/2">
                                New
                              </span>
                            </>
                          )}
                          {product.tag === "discount" && (
                            <>
                              <img src="/bluetag.png" alt="Discount" />
                              <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-[10px] -translate-y-1/2">
                                Save{" "}
                                {Math.round(
                                  ((product.originalPrice - product.price) /
                                    product.originalPrice) *
                                    100,
                                )}
                                %
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {!product.tag && <div></div>}
                      <WishlistButton className="relative" product={product} />
                    </div>

                    <div className="relative mx-auto px-5 w-[80px] s:w-[100px] sm:w-[150px] h-[100px] s:h-[150px] sm:h-[180px]">
                      <Image
                        src={product.image}
                        alt={`${product.name} - Best price in Nigeria`}
                        fill
                        sizes="(max-width: 768px) 100px, 200px"
                        className="absolute mx-auto w-full h-full object-contain"
                      />
                    </div>

                    <div className="z-20 mt-2 px-[10px] sm:px-4">
                      <div className="flex justify-between">
                        <p className="font-normal text-[#767676] text-[10px] sm:text-xs uppercase">
                          {product.category}
                        </p>
                        <div className="flex gap-0.5 items-center">
                          <img
                            src="/star.png"
                            alt="Rating"
                            className="w-3 h-3"
                          />
                          <p className="text-[#1c1b1f] text-[10px] sm:text-xs">
                            {product.averageRating} ({product.ratingsCount})
                          </p>
                        </div>
                      </div>

                      <h2 className="mt-1 font-oswald font-medium text-sm sm:text-base text-ellipsis line-clamp-2 h-10 sm:h-12">
                        {product.name}
                      </h2>

                      <div className="mt-2 pb-4">
                        <div className="flex gap-2 items-center">
                          <p className="font-bold text-[#1c1b1f] text-sm sm:text-lg">
                            {formatAmount(product.price)}
                          </p>
                          {product.originalPrice > product.price && (
                            <p className="text-[#767676] text-xs sm:text-sm line-through">
                              {formatAmount(product.originalPrice)}
                            </p>
                          )}
                        </div>
                        <div className="mt-2">
                          <AddToCartButton
                            className={`flex justify-center ${product.availability ? "bg-black" : "bg-gray-400"} py-2 rounded-md w-full text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors hover:bg-gray-800`}
                            product={product}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>

                {/* Ads/Banners remain in grid */}
                {(index === 1 || index === 6) && !isSearching && (
                  <div className="relative overflow-hidden rounded-md w-[45%] box:w-[273px] mid:w-[240px] s:w-[46%] sm:w-[273px] md:h-[351px]">
                    <img
                      src={index === 1 ? "https://res.cloudinary.com/dm2igxywk/image/upload/v1773396982/WEB_PB_1_x8db8h.jpg" : "https://res.cloudinary.com/dm2igxywk/image/upload/v1773396981/WEB_PB_2_egetio.jpg"} 
                      alt="Latest Tech Deal"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Pagination */}
          <nav
            aria-label="Product pagination"
            className="flex justify-center items-center gap-1 xs:gap-3 mt-10"
          >
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border rounded-md disabled:opacity-30"
            >
              <MdNavigateNext className="rotate-180" />
            </button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border rounded-md disabled:opacity-30"
            >
              <MdNavigateNext />
            </button>
          </nav>
        </div>
      </div>

      <RecentlyViewed />
      <FAQ />
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20 w-full">
          <Loading />
        </div>
      }
    >
      <ProductListInner />
    </Suspense>
  );
}
