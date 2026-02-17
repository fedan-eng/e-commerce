"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// Safe play: stores the promise on the element so we can await it before pausing
function safePlay(videoEl) {
  const p = videoEl.play();
  videoEl._pendingPlay = p;
  if (p !== undefined) {
    p.catch(() => {
      // Autoplay blocked by browser — silently ignored
    });
  }
}

// Safe pause: waits for any pending play() to resolve before calling pause()
// This prevents the "play() interrupted by pause()" console error
function safePause(videoEl, resetTime = false) {
  const pending = videoEl._pendingPlay;
  if (pending !== undefined) {
    pending
      .then(() => {
        videoEl.pause();
        if (resetTime) videoEl.currentTime = 0;
      })
      .catch(() => {});
    videoEl._pendingPlay = undefined;
  } else {
    videoEl.pause();
    if (resetTime) videoEl.currentTime = 0;
  }
}

export default function InfiniteCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  // Map of item.id -> video DOM element
  const videoRefs = useRef({});

  // Ref for the whole carousel wrapper — used for IntersectionObserver
  const carouselRef = useRef(null);

  // Track whether the carousel is currently in the viewport
  const isInViewRef = useRef(true);

  // ─── Play/pause based on which slide is active ───────────────────────────
  useEffect(() => {
    const centerId = items[active].id;

    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (!videoEl) return;
      const numId = Number(id);

      if (numId === centerId) {
        // Only play if the carousel is visible in the viewport
        if (isInViewRef.current) {
          safePlay(videoEl);
        }
      } else {
        safePause(videoEl, true);
      }
    });
  }, [active]);

  // ─── Pause/resume based on viewport visibility ───────────────────────────
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;

        const centerId = items[active].id;
        const centerVideo = videoRefs.current[centerId];
        if (!centerVideo) return;

        if (entry.isIntersecting) {
          // Came back into view — resume the center video
          safePlay(centerVideo);
        } else {
          // Left the viewport — pause the center video
          safePause(centerVideo);
        }
      },
      {
        // Trigger when at least 30% of the carousel is visible
        threshold: 0.3,
      }
    );

    observer.observe(carousel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]); // re-run so observer always has the latest `active` value

  const slideVariants = {
    enter: () => ({ opacity: 0, scale: 0.8 }),
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        scale: { type: "spring", stiffness: 200, damping: 20 },
        opacity: { duration: 0.2 },
      },
    },
    exit: () => ({ opacity: 0, scale: 0.8 }),
  };

  const contentVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  const getVisibleItems = () => {
    const total = items.length;
    const offsets = [-2, -1, 0, 1, 2];
    return offsets.map((offset) => ({
      ...items[(active + offset + total) % total],
      offset,
    }));
  };

  const goNext = () => {
    setDirection(1);
    setActive((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setActive((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleVideoClick = (e, itemId) => {
    const video = e.currentTarget;
    const centerId = items[active].id;

    // Only allow manual toggle on the focused (center) video
    if (itemId !== centerId) return;

    if (video.paused) {
      safePlay(video);
    } else {
      safePause(video);
    }
  };

  return (
    <div ref={carouselRef} className="relative mx-auto px-4 w-full">
      {/* Prev Arrow */}
      <button
        onClick={goPrev}
        className="top-1/2 left-2 md:left-10 lg:left-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <img className="opacity-[100%] -rotate-180" src="/back.png" alt="previous" />
        </div>
      </button>

      {/* Next Arrow */}
      <button
        onClick={goNext}
        className="top-1/2 right-2 md:right-10 lg:right-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <img className="opacity-[100%]" src="/back.png" alt="next" />
        </div>
      </button>

      {/* Carousel */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={true}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) goNext();
          else if (info.offset.x > 50) goPrev();
        }}
        className="flex flex-nowrap justify-center items-center gap-2 h-[420px] overflow-hidden"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {getVisibleItems().map((item) => {
            const pos =
              item.offset === 0 ? "center" : Math.abs(item.offset) === 1 ? "side" : "edge";
            const { h, w } = tileSizes[pos];
            const isCenter = item.offset === 0;

            return (
              <motion.div
                key={item.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 20 },
                  scale: { type: "spring", stiffness: 200, damping: 20 },
                  opacity: { duration: 0.2 },
                  layout: { duration: 0.5, type: "spring", damping: 15, stiffness: 100 },
                }}
                layout
                className="relative flex-shrink-0 shadow-lg"
                style={{ height: `${h}px`, width: `${w}px` }}
              >
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[item.id] = el;
                      el.onended = () => {
                        el.currentTime = 0;
                        if (isInViewRef.current) safePlay(el);
                      };
                    } else {
                      delete videoRefs.current[item.id];
                    }
                  }}
                  onClick={(e) => handleVideoClick(e, item.id)}
                  poster={item.poster}
                  
                  playsInline
                  className="relative rounded-md w-full h-full object-cover cursor-pointer"
                >
                  <source src={item.img} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play overlay — shown only on non-center videos */}
                <motion.div
                  className="bottom-4 left-1/2 z-50 absolute flex justify-center items-center -translate-x-1/2 pointer-events-none"
                  initial="hidden"
                  animate={isCenter ? "hidden" : "visible"}
                  variants={contentVariants}
                >
                  <img src="play.svg" alt="play" />
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
              setDirection(idx > active ? 1 : idx < active ? -1 : 0);
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


