"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

const products = [
  {
    name: "Wearables",
    image: "https://res.cloudinary.com/dm2igxywk/image/upload/v1771511722/zennnnnnn.jpg_pwu3uw_qgdvvh.png",
    link: "/products?categories=Wearables",
  },
  {
    name: "Power Banks",
    image: "https://res.cloudinary.com/dm2igxywk/image/upload/v1771515862/unnamed_fnunic_dfgrc2.png",
    link: "/products?categories=Power Bank",
  },
  {
    name: "Chargers",
    image: "https://res.cloudinary.com/dm2igxywk/image/upload/v1771950402/FIL-Turbo-Charger-4-USB-Ports-4.1A-Output-3-pins_n0d9ze__1_-removebg-preview_ikkrds.png",
    link: "/products?categories=Chargers",
  },
  {
    name: "Lifestyle",
    image: "https://res.cloudinary.com/dm2igxywk/image/upload/v1773665639/Gemini_Generated_Image_7lr1dq7lr1dq7lr1-removebg-preview_tjiny2.png",
    link: "/products?categories=Lifestyle",
  },
  {
    name: "Extensions",
    image: "https://res.cloudinary.com/dm2igxywk/image/upload/v1771950500/FIL-WO35KT-1.jpg_jvmbxd-removebg-preview_o3rwqx.png",
    link: "/products?categories=Extensions",
  },
];

const GAP = 12;

const ProductCategory = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  const updateSizes = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const w = window.innerWidth;

    let visible, cw;

    if (w < 640) {
      // mobile: 1 card + peek of next
      visible = 1;
      cw = containerWidth * 0.82;
    } else if (w < 1024) {
      // tablet: ~2.3 cards
      visible = 2;
      cw = (containerWidth - GAP * 2) / 2.3;
    } else {
      // desktop: 4 full cards + peek of 5th
      visible = 4;
      cw = (containerWidth - GAP * 3) / 4.12;
    }

    setVisibleCount(visible);
    setCardWidth(Math.floor(cw));
  }, []);

  useEffect(() => {
    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [updateSizes]);

  const scrollToIndex = useCallback(
    (index) => {
      const el = scrollRef.current;
      if (!el || cardWidth === 0) return;
      const maxIndex = products.length - visibleCount;
      const clamped = Math.max(0, Math.min(index, maxIndex));
      el.scrollTo({ left: clamped * (cardWidth + GAP), behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [cardWidth, visibleCount]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (cardWidth === 0) return;
      const i = Math.round(el.scrollLeft / (cardWidth + GAP));
      setActiveIndex(Math.min(i, products.length - visibleCount));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [cardWidth, visibleCount]);

  const maxIndex = products.length - visibleCount;
  const dotCount = maxIndex + 1;

  return (
    <div className="mt-12">
      <Header
        header="We Categorize - You Choose"
        imageClassName="order-2"
        className="justify-end"
      />

      {/* Carousel */}
      <div className="relative mt-6">
        {/* Prev Arrow */}
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous"
          className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10
            items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md
            transition-opacity duration-200
            ${activeIndex === 0 ? "opacity-25 cursor-not-allowed" : "opacity-100 hover:bg-gray-50 cursor-pointer"}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar mx-4 md:mx-20 lg:px-12"
          style={{ gap: `${GAP}px`, scrollSnapType: "x mandatory" }}
        >
          {products.map((product, index) => (
            <Link
              href={product.link}
              key={index}
              className="flex-shrink-0 overflow-hidden rounded-xl bg-bright group block"
              style={{
                width: cardWidth > 0 ? `${cardWidth}px` : "260px",
                minWidth: cardWidth > 0 ? `${cardWidth}px` : "260px",
                scrollSnapAlign: "start",
              }}
            >
              {/* Portrait card — same ratio as the BEIS reference */}
              <div
                className="relative w-full aspect-[4/3] sm:aspect-[3/4]"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={1000}
                  height={1000}
                  quality={90}
                  className="object-cover h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
                  //sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 30vw"
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Label */}
                <div className="absolute bottom-0 left-0 w-full px-4 pb-4">
                  <h3 className="font-oswald font-normal text-white text-sm md:text-base uppercase tracking-wide">
                    {product.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= maxIndex}
          aria-label="Next"
          className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10
            items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md
            transition-opacity duration-200
            ${activeIndex >= maxIndex ? "opacity-25 cursor-not-allowed" : "opacity-100 hover:bg-gray-50 cursor-pointer"}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="#222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to position ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "bg-filgreen w-5 h-[6px]"
                : "bg-[#b7b7b7] w-[10px] h-[6px]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCategory;