"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Header from "./Header";

const BestSellerSection = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState("isBestseller"); // default filter

  // Fetch products based on current filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?specials=${filter}&limit=10`);
        const data = await res.json();
        setFilteredProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setFilteredProducts([]);
      }
    };

    fetchProducts();
  }, [filter]);

  return (
    <section className="mt-16">
      {/* Filter Buttons */}
      <div className="">
        <div className="flex justify-between item-center">
          <Header
            imageClassName=" max-sm:hidden scale-x-[-1] "
            header={
              <div className="flex justify-center items-center gap-4 mx-auto max-sm:mx-auto max-sm:w-screen max-sm:max-w-[1000px]">
                <button
                  className={` cursor-pointer font-oswald text-[#b6b6b6] text-xl sm:text-3xl font-medium ${
                    filter === "isBestseller"
                      ? "text-filgreen"
                      : "text-[#b6b6b6]"
                  }`}
                  onClick={() => setFilter("isBestseller")}
                >
                  Best Sellers
                </button>

                <button
                  className={` cursor-pointer font-oswald text-xl sm:text-3xl font-medium ${
                    filter === "isWhatsNew"
                      ? " text-filgreen"
                      : " text-[#b6b6b6]"
                  }`}
                  onClick={() => setFilter("isWhatsNew")}
                >
                  What's New
                </button>

                <button
                  className={`  cursor-pointer font-oswald text-[#b6b6b6] text-xl sm:text-3xl font-medium ${
                    filter === "isTodaysDeal"
                      ? " text-filgreen"
                      : "text-[#b6b6b6]"
                  }`}
                  onClick={() => setFilter("isTodaysDeal")}
                >
                  Today's Deal
                </button>
              </div>
            }
          />

          <p className="max-nav:hidden self-end mb-8 pr-10 text-[#007c42] text-sm underline">
            {filter === "isBestseller" && (
              <Link href="/products?specials=isBestseller&sort=default">
                Shop All Our Best Sellers
              </Link>
            )}
            {filter === "isWhatsNew" && (
              <Link href="/products?specials=isWhatsNew&sort=default">
                Shop All What's New
              </Link>
            )}
            {filter === "isTodaysDeal" && (
              <Link href="/products?specials=isTodaysDeal&sort=default">
                Shop All Today's Deals
              </Link>
            )}
          </p>
        </div>
      </div>

      {/* Horizontal Product Scroll */}
      <div className="mx-auto overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar">
        <div className="inline-flex gap-4 px-4 sm:px-10 md:px-20 pt-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 5).map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                productName={product.name}
                productImage={product.image}
                productAverageRating={product.averageRating}
                productRatingCount={product.ratingsCount}
                originalPrice={product.originalPrice}
                productPrice={product.price}
                productDesc={product.description}
                productCategory={product.category}
                className="bg-white"
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">
              No Product avaliable
            </p>
          )}
        </div>
      </div>
      <div className="nav:hidden mx-4 sm:mx-10 md:mx-20 mt-4 py-2 sm:py-3 border border-[#d9d9d9] rounded-md text-[#007c42] text-xs sm:text-sm text-center">
        {filter === "isBestseller" && (
          <Link href="/products?specials=isBestseller">
            Shop All Our Best Sellers
          </Link>
        )}
        {filter === "isWhatsNew" && (
          <Link href="/products?specials=isWhatsNew">Shop All What's New</Link>
        )}
        {filter === "isTodaysDeal" && (
          <Link href="/products?specials=isTodaysDeal">
            Shop All Today's Deals
          </Link>
        )}
      </div>
    </section>
  );
};

export default BestSellerSection;
