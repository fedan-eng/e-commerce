"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Accordion from "./Accordion";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { getFilteredProducts, setFilters } from "@/store/features/productSlice";
import PriceRange from "@/components/PriceRange";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import { IoFilter } from "react-icons/io5";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductFilter() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useSelector((state) => state.products.filters);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedFilters = useDebounce(filters, 500); // 500ms delay

  //On first render, hydrate filters from query string
  useEffect(() => {
    const categories = searchParams.get("categories")?.split(",") || [];
    const specials = searchParams.get("specials")?.split(",") || [];
    const features = searchParams.get("features")?.split(",") || [];
    const availability = searchParams.get("availability") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const minRating = searchParams.get("minRating")
      ? Number(searchParams.get("minRating"))
      : null;
    const sort = searchParams.get("sort") || "";

    dispatch(
      setFilters({
        categories,
        specials,
        features,
        availability,
        minPrice,
        maxPrice,
        minRating,
        sort,
      })
    );
  }, [dispatch, searchParams]);

  const toggleSelection = useCallback(
    (field, value) => {
      const current = filters[field] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      dispatch(setFilters({ ...filters, [field]: updated }));

      // Close sidebar on mobile
      setIsOpen(false);
    },
    [dispatch, filters]
  );

  const updateSingleFilter = useCallback(
    (field, value) => {
      dispatch(setFilters({ ...filters, [field]: value }));

      // Close sidebar on mobile
      setIsOpen(false);
    },
    [dispatch, filters]
  );

  const handlePriceChange = useCallback(
    ({ minPrice, maxPrice }) => {
      dispatch(setFilters({ ...filters, minPrice, maxPrice }));
    },
    [dispatch, filters]
  );

  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const params = new URLSearchParams();

    if (debouncedFilters.categories?.length)
      params.set("categories", debouncedFilters.categories.join(","));
    if (debouncedFilters.specials?.length)
      params.set("specials", debouncedFilters.specials.join(","));
    if (debouncedFilters.features?.length)
      params.set("features", debouncedFilters.features.join(","));
    if (debouncedFilters.availability)
      params.set("availability", debouncedFilters.availability);
    if (debouncedFilters.minPrice)
      params.set("minPrice", debouncedFilters.minPrice);
    if (debouncedFilters.maxPrice)
      params.set("maxPrice", debouncedFilters.maxPrice);
    if (debouncedFilters.minRating)
      params.set("minRating", debouncedFilters.minRating);
    if (debouncedFilters.sort) params.set("sort", debouncedFilters.sort);

    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ""}`);
    dispatch(getFilteredProducts(debouncedFilters));
  }, [debouncedFilters, router, dispatch]);

  const shopbyOptions = useMemo(
    () => ({
      title: "Shop by",
      content: (
        <div>
          {[
            { key: "isBestseller", label: "Best Seller" },
            { key: "isWhatsNew", label: "What's New" },
            { key: "isTodaysDeal", label: "Today's Deal" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 py-2 text-xs cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.specials?.includes(key) || false}
                onChange={() => toggleSelection("specials", key)}
                className="peer hidden"
              />
              <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                <svg
                  className="peer-checked:block w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              {label}
            </label>
          ))}
        </div>
      ),
    }),
    [filters.specials, toggleSelection]
  );

  // Shop by accordion — open if any special is active
const shopByDefaultOpen = filters.specials?.length > 0 ? 0 : null;

// For the main accordion — open whichever section has an active filter
const accordionDefaultOpen = useMemo(() => {
  if (filters.categories?.length > 0) return 0;
  if (filters.features?.length > 0) return 1;
  if (filters.availability) return 2;
  if (filters.minRating) return 3;
  return null; // none open by default
}, [filters]);

  const accordionItems = useMemo(
    () => [
      {
        title: "Categories",
        content: (
          <div className="mb-4">
            {[
              "Power Bank",
              "Wearables",
              "Chargers",
              "Lifestyle",
              "Extensions",
            ].map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 py-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(cat) || false}
                  onChange={() => toggleSelection("categories", cat)}
                  className="peer hidden"
                />
                <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                  <svg
                    className="peer-checked:block w-3 h-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {cat}
              </label>
            ))}
          </div>
        ),
      },
      {
        title: "Features",
        content: (
          <div className="mb-4">
            {[
              "Fast Charging",
              "Universal Compatibility",
              "Long Lasting Battery",
            ].map((feat) => (
              <label
                key={feat}
                className="flex items-center gap-2 py-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.features?.includes(feat) || false}
                  onChange={() => toggleSelection("features", feat)}
                  className="peer hidden"
                />
                <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                  <svg
                    className="peer-checked:block w-3 h-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {feat}
              </label>
            ))}
          </div>
        ),
      },
      {
        title: "Availability",
        content: (
          <div className="mb-4">
            <label className="flex items-center gap-2 py-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availability === "inStock"}
                onChange={(e) =>
                  updateSingleFilter(
                    "availability",
                    e.target.checked ? "inStock" : ""
                  )
                }
                className="peer hidden"
              />
              <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                <svg
                  className="peer-checked:block w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              In Stock
            </label>
          </div>
        ),
      },
      {
        title: "Ratings",
        content: (
          <div className="mb-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <label
                key={star}
                className="flex items-center gap-2 py-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.minRating === star}
                  onChange={() =>
                    updateSingleFilter(
                      "minRating",
                      filters.minRating === star ? null : star
                    )
                  }
                  className="peer hidden"
                />
                <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                  <svg
                    className="peer-checked:block w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {star} Star{star > 1 ? "s" : ""}
              </label>
            ))}
          </div>
        ),
      },
    ],
    [filters, toggleSelection, updateSingleFilter]
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="items-center font-bold text-base cursor-pointer"
        >
          <div className="flex justify-center items-center gap-1">
            <IoFilter /> <span className="underline"> Open Filters</span>
          </div>
        </button>
      </div>

      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          className="lg:hidden z-40 fixed inset-0 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full no-scrollbar overflow-scroll w-[80%] max-w-[400px] lg:max-w-[200px] border border-[#d9d9d9] bg-white z-50 transform transition-transform duration-300 p-2 rounded-md
          lg:static lg:h-auto lg:w-full xl:w-full xl:max-w-[273px] lg:translate-x-0
          ${isOpen ? " translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="lg:hidden flex justify-between items-center p-4 pt-2 pb-1 border-[#eaeaea] border-b">
          <h2 className="font-oswald font-medium text-[20px] tracking-[0%]">
            Filters
          </h2>

          <p
            className="font-bold hover:rotate-90 transition-transform duration-300 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </p>
        </div>
        <div className="max-lg:hidden flex justify-between items-center pt-2 pb-1 border-[#eaeaea] border-b">
          <h2 className="font-oswald font-medium text-[20px] tracking-[0%]">
            Filters
          </h2>
        </div>

        <Accordion
          items={[shopbyOptions]}
          defaultOpenIndex={shopByDefaultOpen}
          headerClassName="text-xs mt-4 mb-4 font-medium"
          contentClassName="text-sm"
          icon={({ isOpen }) => (isOpen ? <GoChevronUp /> : <GoChevronDown />)}
          iconClassName="text-black text-lg font-bold"
        />

        <PriceRange
          min={0}
          max={500000}
          onChange={handlePriceChange}
        />

        <Accordion
          items={accordionItems}
          defaultOpenIndex={accordionDefaultOpen}
          headerClassName="text-xs mt-9 mb-4 font-medium"
          contentClassName="text-sm"
          icon={({ isOpen }) => (isOpen ? <GoChevronUp /> : <GoChevronDown />)}
          iconClassName="text-black text-lg font-bold"
        />
      </aside>
    </>
  );
}
