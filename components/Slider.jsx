"use client";

import { useEffect, useState } from "react";
import { homeImages } from "../constants/homeCarousel";
import Description from "./Description";
import { motion } from "framer-motion";

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
    }, 5000); 
    return () => {
      clearTimeout(timer);
    };
  }, [activeImage]);

  return (
    <main className="relative overflow-hidden group">
      {/* Image Container */}
      <div className="w-full h-[400px] md:h-[600px] relative">
        {homeImages.map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0 w-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: idx === activeImage ? 1 : 0,
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
          >
            <motion.img
              src={item.src}
              alt={item.title}
              title={item.title}
              className={`w-full h-full ${item.id === 1 ? "object-right" : ""} object-cover`}
              initial={{ scale: 1.1 }} // Slight scale for effect
              animate={idx === activeImage ? { scale: 1 } : {}} 
              transition={{ duration: 3 }}
            />
          </motion.div>
        ))}

        {/* --- Side Navigation Arrows --- */}
        <button 
          onClick={clickPrev}
          className="absolute  hover:cursor-pointer left-4 top-1/2 -translate-y-1/2 z-40 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <img src="/homearrow.svg" className="w-8 h-8 rotate-180 brightness-200" alt="Prev" />
        </button>
        <button 
          onClick={clickNext}
          className="absolute hover:cursor-pointer  right-4 top-1/2 -translate-y-1/2 z-40 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <img src="/homearrow.svg" className="w-8 h-8 brightness-200" alt="Next" />
        </button>

        {/* --- Dot Navigation --- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {homeImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`h-2 transition-all hover:cursor-pointer duration-300 rounded-full ${
                idx === activeImage ? "w-8 bg-mustard" : "w-2 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Description Overlay */}
      <div className="top-1/2 left-1/2 absolute w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="pointer-events-auto">
          <Description
            activeImage={activeImage}
            clickNext={clickNext}
            clickPrev={clickPrev}
          />
        </div>
      </div>

      {/* Thumbnail Carousel Section (Commented as requested) */}
      <div className="max-sm:hidden z-50 mb-3 px-4 w-full overflow-hidden">
        {/* <div
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
                className="rounded-md w-[216px] h-[112px] object-cover" 
              />
            </div>
          ))}
        </div> 
        */}

        {/* Bottom Navigation Buttons (Redundant if using Side Arrows, but kept/styled) */}
        <div className="z-50 relative flex justify-center items-center gap-6 mt-4 md:hidden">
          <button
            className="-rotate-180 text-white text-lg hover:scale-110 transition-transform"
            onClick={clickPrev}
          >
            <img src="/homearrow.svg" alt="Back" />
          </button>

          <button
            className="text-white text-lg hover:scale-110 transition-transform"
            onClick={clickNext}
          >
             <img src="/homearrow.svg" alt="Forward" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default Slider;