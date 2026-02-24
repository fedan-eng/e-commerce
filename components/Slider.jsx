"use client";

import { useEffect, useState } from "react";
import { homeImages } from "../constants/homeCarousel";
import Description from "./Description";
import { motion } from "framer-motion";
import { IoChevronForwardCircleOutline } from "react-icons/io5";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const Slider = () => {
  const [activeImage, setActiveImage] = useState(0);

  const clickNext = () => {
    setActiveImage((prev) => (prev === homeImages.length - 1 ? 0 : prev + 1));
  };

  const clickPrev = () => {
    setActiveImage((prev) => (prev === 0 ? homeImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      clickNext();
    }, 5000); // Change every 10 seconds
    return () => {
      clearTimeout(timer);
    };
  }, [activeImage]);

  return (
    <main className="relative overflow-hidden">
      <div className="w-full h-[400px]">
        {homeImages.map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0 w-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: idx === activeImage ? 1 : 0,
            }}
            transition={{
              duration: 1, // Adjust for smoothness
              ease: "easeOut",
            }}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <motion.img
              key={activeImage}
              src={item.src}
              alt=""
              width={400}
              height={400}
              className="w-full h-full object-contain overflow-hidden"
              initial={{ scale: 1 }} // Start at normal scale
              animate={idx === activeImage ? { scale: 1.1 } : {}} // Only scale the active image
              transition={{
                duration: 3,
              }}
            ></motion.img>
          </motion.div>
        ))}
      </div>

      <div className="top-1/2 left-1/2 absolute w-full -translate-x-1/2 -translate-y-1/2">
        <Description
          activeImage={activeImage}
          clickNext={clickNext}
          clickPrev={clickPrev}
        />
      </div>

      {/* Thumbnail Carousel */}
      <div className="max-sm:hidden z-50 mb-3 px-4 w-full overflow-hidden">
        <div
          className="flex gap-3 transition-transform duration-300"
          style={{ transform: "translateX(55%)" }}
        >
          {homeImages.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`cursor-pointer border-4 rounded overflow-hidden transition-all duration-300
            ${
              idx === activeImage
                ? "border-mustard scale-105 hidden"
                : "border-transparent opacity-100 z-30"
            }
          `}
            >
              <img
                src={item.src}
                alt={`Thumbnail ${idx}`}
                className="rounded-md w-[216px] h-[112px] object-cover" // width ~54 * 4 to match w-54
              />
            </div>
          ))}
        </div>
        <div className="z-50 relative flex justify-center items-center gap-6 mt-4">
          <button
            className="left-28 -rotate-180 relative text-white text-lg"
            onClick={clickPrev}
          >
            <img src = "/homearrow.svg"/>
          </button>

          <button
            className="left-28 relative text-white text-lg"
            onClick={clickNext}
          >
             <img src = "/homearrow.svg"/>
          </button>
        </div>
      </div>
    </main>
  );
};

export default Slider;
