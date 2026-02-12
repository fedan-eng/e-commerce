"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { formatAmount } from "@/lib/utils";

const products = [
  {
    name: "Power Banks",
    img: "/pow.webp",
    price: "13000",
    originalPrice: "20000",
    desc: "250W High-Efficiency Charger",
  },
  {
    name: "Wireless Earbuds",
    img: "/charger.webp",
    price: "9000",
    originalPrice: "12000",
    desc: "Best Sound Quality",
  },
  {
    name: "PlayerStations",
    img: "/exte.webp",
    price: "26000",
    originalPrice: "30000",
    desc: "High-Performance Gaming Console",
  },
  {
    name: "Game Controllers",
    img: "/pow.webp",
    price: "30000",
    originalPrice: "35000",
    desc: "Ergonomic Design for Comfort",
  },
];

const MemberSection = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize(); // Run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="bg-fixed mt-16 py-10 home-stick">
      <div className="px-6 py-10">
        <h2 className="text-light text-4xl md:text-5xl tracking-tighter">
          Become a Member Today
        </h2>
        <p className="py-4 text-mustard tracking-wider">
          Gain early access to new products, exclusive deals, and opportunities
          to try our products for free.
        </p>
        <div className="flex gap-6 pb-10">
          <button className="hover:bg-mustard px-1 xs:px-3 py-1 xs:py-3 border-2 border-green-800 hover:border-mustard font-poppins text-light hover:text-dark text-xs xs:text-sm">
            Login
          </button>
          <button className="buttons">Join Now</button>
        </div>
      </div>

      <div className="mx-auto overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar">
        <div className="inline-flex gap-4 px-10">
          {products.map((product, index) => (
            // PRODUCT CARDS
            <div key={index}>
              <ProductCard
                key={index}
                productName={product.name}
                productImage={product.img}
                originalPrice={product.originalPrice}
                productPrice={product.price}
                productDesc={product.desc}
                className="bg-dark"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemberSection;
