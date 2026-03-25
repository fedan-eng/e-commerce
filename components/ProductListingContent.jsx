"use client";
import React from "react";
import {useEffect, useState} from "react";
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

function ProductListingContent() {
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
                  className="flex items-center gap-2 px-2 py-2 border border-[#007c42] rounded-2xl text-[#007c42] text-sm cursor-pointer"
                  onClick={() =>
                    dispatch(removeFilterTag({type: "specials", value: special}))
                  }
                >
                  {special} <p>✕</p>
                </span>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full py-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="disabled:opacity-50 p-2"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from({length: totalPages}, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 rounded ${
                          page === i + 1
                            ? "bg-[#007c42] text-white"
                            : "border border-[#d9d9d9]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="disabled:opacity-50 p-2"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#3e3e3e]">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed & FAQ */}
      <RecentlyViewed />
      <FAQ />
    </div>
  );
}

function ProductCard({product}) {
  const dispatch = useDispatch();

  return (
    <Link href={`/products/${product._id}`}>
      <div className="relative group cursor-pointer border border-[#eaeaea] rounded-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Product Image */}
        <div className="relative h-48 md:h-56 bg-[#f5f5f5] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.tag && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {product.tag}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <p className="text-xs text-[#666] mt-1 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs">★ {product.averageRating.toFixed(1)}</span>
              <span className="text-xs text-[#999]">({product.ratingsCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-3 flex items-end gap-2">
            <span className="font-bold text-lg">₦{formatAmount(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs line-through text-[#999]">
                ₦{formatAmount(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <AddToCartButton product={product} />
            <WishlistButton product={product} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductListingContent;
