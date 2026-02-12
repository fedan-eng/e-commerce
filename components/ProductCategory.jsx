"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const products = [
  {
    name: "Wearables",
    image: "/zen2.png",
    link: "/products?categories=Wearables",
  },
  {
    name: "Power Banks",
    image: "/pow2.png",
    link: "/products?categories=Power Bank",
  },
  {
    name: "Chargers",
    image: "/char2.png",
    link: "/products?categories=Chargers",
  },
  {
    name: "Lifestyle",
    image: "/pro2.png",
    link: "/products?categories=Lifestyle",
  },
  {
    name: "Extensions",
    image: "/ext2.png",
    link: "/products?categories=Extensions",
  },
];

const ProductCategory = () => {
  const [scrollStep, setScrollStep] = useState(0);
  const scrollRef = useRef(null);

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1170);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;

    const onScroll = () => {
      if (!el) return;
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;

      const ratio = maxScroll === 0 ? 0 : scrollLeft / maxScroll;

      if (ratio <= 0.2) {
        setScrollStep(0);
      } else if (ratio > 0.2 && ratio <= 0.7) {
        setScrollStep(1);
      } else {
        setScrollStep(2);
      }
    };

    if (el) el.addEventListener("scroll", onScroll);

    return () => {
      if (el) el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // This scrollToStep is the one directly called by the buttons
  const scrollToStep = (step) => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const targetScroll =
      step === 0 ? 0 : step === 1 ? maxScroll / 2 : maxScroll;

    el.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <Header
        header="We Categorize - You Choose"
        imageClassName="order-2"
        className="justify-end mt-12"
      />

      {isLargeScreen && (
        <div className="flex flex-nowrap justify-center gap-2">
          {products.map((product, index) => (
            <Link
              href={product.link}
              key={index}
              target="_blank"
              className="flex justify-between bg-bright rounded-md w-[221px] h-[136px] overflow-hidden"
            >
              <h3 className="pt-3 pl-3 font-oswald font-normal text-sm uppercase no-whitspace-nowrap">
                {product.name}
              </h3>

              <motion.div
                whileHover={{
                  scale: 1.1,
                  transition: {
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 10,
                  },
                }}
                className="justify-self-end"
              >
                <Image
                  src={product.image}
                  alt="Chargers"
                  width={260}
                  height={260}
                  className="rounded-md w-full h-full object-cover"
                />
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {!isLargeScreen && (
        <div
          ref={scrollRef}
          className="mx-auto overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar"
        >
          <div className="inline-flex justify-center gap-2 px-4 pt-6">
            {products.map((product, index) => (
              <Link
                href={product.link}
                key={index}
                className="flex justify-between bg-bright rounded-md w-[150px] sm:w-[178px] md:w-[221px] h-[92px] sm:h-[110px] md:h-[136px] overflow-hidden"
              >
                <h3 className="pt-3 pl-3 font-oswald font-normal text-sm uppercase">
                  {product.name}
                </h3>

                <motion.div
                  whileHover={{
                    scale: 1.1,
                    transition: {
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300,
                      damping: 10,
                    },
                  }}
                  className="justify-self-end overflow-hidden"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={130}
                    height={130}
                    className="rounded-md w-full h-full object-cover"
                  />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLargeScreen && (
        <div className="flex justify-center gap-2 mt-4 px-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => scrollToStep(i)}
              className={`h-2 w-2 rounded-full ${
                scrollStep === i
                  ? "bg-filgreen w-5 h-[6px]"
                  : "bg-[#b7b7b7] h-[6px] w-[10px]"
              } transition-all duration-300`}
              aria-label={`Scroll to ${
                i === 0 ? "start" : i === 1 ? "middle" : "end"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCategory;
