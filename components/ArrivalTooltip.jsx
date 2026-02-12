"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const categories = [
  { name: "Power Bank", key: "Power Bank" },
  { name: "Wearables", key: "Wearables" },
  { name: "Chargers", key: "Chargers" },
  { name: "Lifestyle", key: "Lifestyle" },
  { name: "Extensions", key: "Extensions" },
];

const ArrivalTooltip = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch products by category
  async function fetchProductsByCategory(category) {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/products?categories=${encodeURIComponent(category)}&limit=4`
      );
      const data = await res.json();
      setFilteredProducts(data.products || []);
    } catch (err) {
      console.error("Failed fetching products:", err);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // load default category (Power Bank) on mount
  useEffect(() => {
    fetchProductsByCategory(categories[0].key);
  }, []);

  // when user hovers a category, fetch its products
  useEffect(() => {
    if (activeCat !== null) {
      const key = categories[activeCat]?.key;
      if (key) fetchProductsByCategory(key);
    }
  }, [activeCat]);

  return (
    <li
      className="flex justify-left items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="font-roboto text-white hover:text-mustard text-sm">
        NEW ARRIVALS
      </p>

      <AnimatePresence>
        {isHovered && (
            <motion.div
            onMouseEnter={() => setIsHovered(true)}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="top-28 left-0 z-60 absolute bg-white w-full"
          >
            <div className="flex items-center gap-5 px-13 py-4">
              {/* SECTION A - Categories */}
              <div className="flex flex-col w-60">
                {categories.map((cat, index) => (
                  <div
                    onMouseEnter={() => setActiveCat(index)}
                    //onMouseLeave={() => setActiveCat(null)} // reset to all when leaving a category
                    className={`flex justify-between items-center py-2 px-2 text-sm cursor-pointer ${
                      index === activeCat ? "bg-[#f6f6f6] rounded " : ""
                    }`}
                    key={cat.key}
                  >
                    {cat.name}
                    <span>
                      <img
                        className="p-2"
                        src="/arrow_down.svg"
                      />
                    </span>
                  </div>
                ))}
              </div>

              {/* SECTION B - Products */}
              <div>
                <div className="gap-4 grid grid-cols-5">
                  {Array.isArray(filteredProducts) &&
                  filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                      <Link
                        key={item._id ?? item.id}
                        href={`/products/${item._id ?? item.id}`}
                      >
                        <div className="max-w-[205px] h-full max-h-[187px] cursor-pointer">
                          <div className="flex justify-center items-center">
                            <img
                              src={item.image ?? "/placeholder.png"}
                              alt={item.name}
                              className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px] h-[150px] object-contain"
                            />
                          </div>
                          <p className="mt-4 font-oswald font-medium text-sm text-center line-clamp-1">
                            {item.name}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="col-span-4 py-8 text-gray-500 text-center">
                      No products available
                    </p>
                  )}

                  {/* Link to see all in category */}
                  <Link
                    href={`/products?categories=${categories[activeCat ?? 0].key}`}
                    className="flex items-center self-end gap-1 text-[#007c42] text-sm underline"
                  >
                    All {categories[activeCat ?? 0].name} →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default ArrivalTooltip;
