"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdSearch } from "react-icons/io";
import { useState, useEffect } from "react";
import axios from "axios";

const categories = [
  {
    name: "Power Banks",
    image: "/powerbanks.png",
    link: "/products?categories=Power Bank",
  },
  {
    name: "Wearables",
    image: "/wearables.png",
    link: "/products?categories=Wearables",
  },
  {
    name: "Chargers",
    image: "/chargers.png",
    link: "/products?categories=Chargers",
  },
  {
    name: "Lifestyle",
    image: "/lifestyle.png",
    link: "/products?categories=Lifestyle",
  },
  {
    name: "Extensions",
    image: "/extensions.png",
    link: "/products?categories=Extensions",
  },
];

const NavSearchTooltip = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  // FETCH SEARCH RESULTS
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/products?search=${searchTerm}`);
        setResults(res.data.products.slice(0, 5)); // Limit for dropdown
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <li
      className="flex justify-center items-center"
      onClick={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-nav:hidden flex items-center gap-2 bg-white px-2 py-2 border border-[#d9d9d9] rounded-4xl">
        <span>
          <IoMdSearch
            size={12}
            className="text-black"
          />
        </span>
        <input
          name="text"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block outline-0 w-full placeholder-text-xs text-xs placeholder-[#929292]"
        />
      </div>

      <div className="nav:hidden">
        <span>
          <IoMdSearch className="text-white text-3xl cursor-pointer" />
        </span>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="top-28 max-sm:left-0 z-50 absolute bg-white sm:mr-80 sm:rounded-md w-full sm:w-[549px]"
          >
            <div className="flex max-sm:flex-col gap-5 p-4">
              {/* LEFT SECTION */}
              <div>
                <p className="hidden sm:block mb-4 font-oswald text-sm uppercase">
                  FIL CATEGORIES
                </p>
                <p className="sm:hidden block mb-4 font-oswald text-sm uppercase">
                  SEARCH PRODUCT
                </p>

                {/* CATEGORY GRID */}
                <div className="hidden gap-3 sm:grid grid-cols-2">
                  {categories.map((cat, i) => (
                    <Link
                      href={cat.link}
                      key={i}
                      className="flex bg-[#f2f2f2] rounded-md"
                    >
                      <span className="pt-2 pl-2 font-oswald text-sm uppercase">
                        {cat.name}
                      </span>
                      <div className="ml-auto">
                        <Image
                          width={70}
                          height={70}
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* SEARCH (mobile) */}
                <div className="sm:hidden flex items-center gap-2 bg-white px-2 py-2 border border-[#d9d9d9] rounded-md">
                  <span>
                    <IoMdSearch className="text-filgrey text-base" />
                  </span>
                  <input
                    name="text"
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block outline-0 w-full placeholder-text-base placeholder-filgrey"
                  />
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="sm:px-4 sm:border-[#dfdfdf] sm:border-l">
                {/* SEARCH RESULTS */}
                {results.length > 0 && (
                  <>
                    <p className="mb-4 font-oswald text-sm uppercase">
                      SEARCH RESULTS
                    </p>

                    <div className="mb-4">
                      {results.map((product) => (
                        <Link
                          href={`/products/${product._id}`}
                          key={product._id}
                          className="flex items-center gap-2 hover:bg-gray-100 px-1 py-2"
                        >
                          <IoMdSearch className="text-black text-base" />
                          <p className="text-sm underline line-clamp-1">
                            {product.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* TOP SUGGESTIONS (only show when no search OR no results) */}
                {results.length === 0 && (
                  <>
                    <p className="mb-4 font-oswald text-sm uppercase">
                      TOP SUGGESTIONS
                    </p>

                    <div>
                      <div className="flex items-center gap-1 px-1 py-2">
                        <IoMdSearch className="text-black text-base" />
                        <Link
                          href="/products/691b041af0ddc5e1e75e1ed0"
                          className="text-sm underline line-clamp-1"
                        >
                          FIL Bolt Pro 32,500 mAh Power Bank
                        </Link>
                      </div>

                      <div className="flex items-center gap-1 px-1 py-2">
                        <IoMdSearch className="text-black text-base" />
                        <Link
                          href="/products/691b18d96ab12366ceef60e4"
                          className="text-sm underline line-clamp-1"
                        >
                          FIL Pulse 3
                        </Link>
                      </div>

                      <div className="flex items-center gap-1 px-1 py-2">
                        <IoMdSearch className="text-black text-base" />
                        <Link
                          href="/products/691b18d96ab12366ceef60dc"
                          className="text-sm underline line-clamp-1"
                        >
                          FIL Mag-Flex 10,000mAh Powerbank
                        </Link>
                      </div>
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
