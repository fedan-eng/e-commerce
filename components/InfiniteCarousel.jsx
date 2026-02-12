"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const items = [
  {
    id: 1,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861460/qnhszpzr7ggftmskvymv.mp4",
    poster:
      "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861460/qnhszpzr7ggftmskvymv.jpg",
  },
  {
    id: 2,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861462/tziomqejz0invbax2dfj.mp4",
    poster:
      "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861462/tziomqejz0invbax2dfj.jpg",
  },
  {
    id: 3,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861466/wsfu4g2qqtxmobkvv2vj.mp4",
    poster:
      "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861466/wsfu4g2qqtxmobkvv2vj.jpg",
  },
  {
    id: 4,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861467/oidc91wiime1eedrjf9j.mp4",
    poster:
      "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861467/oidc91wiime1eedrjf9j.jpg",
  },
  {
    id: 5,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753864791/nc7j92nsr7oztwhzuk3i.mp4",
    poster:
      "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753864791/nc7j92nsr7oztwhzuk3i.jpg",
  },
];

const tileSizes = {
  center: { h: 407, w: 222 },
  side: { h: 359, w: 221 },
  edge: { h: 311, w: 222 },
};

export default function InfiniteCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const slideVariants = {
    enter: (direction) => ({
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        scale: { type: "spring", stiffness: 200, damping: 20 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction) => ({
      opacity: 0,
      scale: 0.8,
    }),
  };

  // Variants for the play button content
  const contentVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  const getVisibleItems = () => {
    const total = items.length;
    const result = [];
    const offsets = [-2, -1, 0, 1, 2]; // 5 visible items

    offsets.forEach((offset) => {
      const itemIndex = (active + offset + total) % total;
      result.push({
        ...items[itemIndex],
        offset: offset, // Store relative offset
      });
    });
    return result;
  };

  const goNext = () => {
    setDirection(1);
    setActive((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setActive((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative mx-auto px-4 w-full">
      {/* Arrows */}
      <button
        onClick={goPrev}
        className="top-1/2 left-2 md:left-10 lg:left-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <img
            className="opacity-[100%] -rotate-180"
            src="/back.png"
            alt="back"
          />
        </div>
      </button>

      <button
        onClick={goNext}
        className="top-1/2 right-2 md:right-10 lg:right-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <img
            className="opacity-[100%]"
            src="/back.png"
            alt="back"
          />
        </div>
      </button>

      {/* Carousel Container - overflow-hidden is crucial here */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={true}
        onDragEnd={(event, info) => {
          if (info.offset.x < -50) {
            goNext();
          } else if (info.offset.x > 50) {
            goPrev();
          }
        }}
        className="flex flex-nowrap justify-center items-center gap-2 h-[420px] overflow-hidden"
      >
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="popLayout"
        >
          {getVisibleItems().map((item) => {
            let pos;
            if (item.offset === 0) {
              pos = "center";
            } else if (item.offset === -1 || item.offset === 1) {
              pos = "side";
            } else {
              pos = "edge";
            }

            const { h, w } = tileSizes[pos];

            return (
              <motion.div
                key={item.id} // Essential for AnimatePresence
                custom={direction} // Pass direction to variants
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                // Main transition for all properties, layout is also animated
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 20 },
                  scale: { type: "spring", stiffness: 200, damping: 20 },
                  opacity: { duration: 0.2 }, // General opacity
                  layout: {
                    duration: 0.5,
                    type: "spring",
                    damping: 15,
                    stiffness: 100,
                  },
                }}
                layout // Animate size and internal position within its slot
                className="relative flex-shrink-0 shadow-lg"
                style={{
                  height: `${h}px`,
                  width: `${w}px`,

                  // zIndex: pos === "center" ? 30 : pos === "side" ? 20 : 10,
                }}
              >
                <video
                  ref={(ref) => {
                    if (ref) {
                      ref.onended = () => ref.load(); // Reset after ending if needed
                    }
                  }}
                  onClick={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                  poster={item.poster}
                  className="relative rounded-md w-full h-full object-cover cursor-pointer"
                >
                  <source
                    src={item.img}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>

                <motion.div
                  className="bottom-4 left-1/2 z-50 absolute flex justify-center items-center -translate-x-1/2 pointer-events-none"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={contentVariants}
                >
                  <img src="play.svg" />
                  <p className="px-1 py-2 text-white">Play</p>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              const currentActiveLogical = active;
              const newActiveLogical = idx;

              if (newActiveLogical > currentActiveLogical) {
                setDirection(1);
              } else if (newActiveLogical < currentActiveLogical) {
                setDirection(-1);
              } else {
                setDirection(0);
              }
              setActive(idx);
            }}
            className={`transition-all rounded-md ${
              idx === active
                ? "bg-filgreen w-5 h-[6px]"
                : "bg-[#b7b7b7] w-[10px] h-[6px]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
