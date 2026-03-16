"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const items = [
  {
    id: 1,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861460/qnhszpzr7ggftmskvymv.mp4",
    poster: "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861460/qnhszpzr7ggftmskvymv.jpg",
  },
  {
    id: 2,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861462/tziomqejz0invbax2dfj.mp4",
    poster: "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861462/tziomqejz0invbax2dfj.jpg",
  },
  {
    id: 3,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861466/wsfu4g2qqtxmobkvv2vj.mp4",
    poster: "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861466/wsfu4g2qqtxmobkvv2vj.jpg",
  },
  {
    id: 4,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753861467/oidc91wiime1eedrjf9j.mp4",
    poster: "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753861467/oidc91wiime1eedrjf9j.jpg",
  },
  {
    id: 5,
    img: "https://res.cloudinary.com/dyf0wsiaf/video/upload/v1753864791/nc7j92nsr7oztwhzuk3i.mp4",
    poster: "https://res.cloudinary.com/dyf0wsiaf/video/upload/so_0/v1753864791/nc7j92nsr7oztwhzuk3i.jpg",
  },
];

// ─── Adjustable preview duration (ms) ────────────────────────────────────────
const PREVIEW_DURATION = 7000;

const tileSizes = {
  center: { h: 407, w: 222 },
  side: { h: 359, w: 221 },
  edge: { h: 311, w: 222 },
};

function safePlay(videoEl) {
  const p = videoEl.play();
  videoEl._pendingPlay = p;
  if (p !== undefined) p.catch(() => {});
}

function safePause(videoEl, resetTime = false) {
  const pending = videoEl._pendingPlay;
  if (pending !== undefined) {
    pending.then(() => {
      videoEl.pause();
      if (resetTime) videoEl.currentTime = 0;
    }).catch(() => {});
    videoEl._pendingPlay = undefined;
  } else {
    videoEl.pause();
    if (resetTime) videoEl.currentTime = 0;
  }
}

function applyIOSInlineAttributes(el) {
  if (!el) return;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.setAttribute("x5-playsinline", "");
  el.setAttribute("x5-video-player-type", "h5");
  el.setAttribute("x5-video-player-fullscreen", "false");
}

export default function InfiniteCarousel() {
  const [active, setActive] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [direction, setDirection] = useState(0);
  // "preview" = auto-sliding mode | "watching" = user clicked, stay on this video
  const [mode, setMode] = useState("preview");

  const videoRefs = useRef({});
  const carouselRef = useRef(null);
  const isInViewRef = useRef(true);
  const autoSlideTimer = useRef(null);
  const progressRef = useRef(null); // for the progress bar animation

  // ── Slide helpers ────────────────────────────────────────────────────────
  const goTo = useCallback((index, dir) => {
    setDirection(dir);
    setActive(index);
  }, []);

  const goNext = useCallback(() => {
    goTo((active + 1) % items.length, 1);
  }, [active, goTo]);

  const goPrev = useCallback(() => {
    goTo((active - 1 + items.length) % items.length, -1);
  }, [active, goTo]);

  // ── Auto-slide timer ─────────────────────────────────────────────────────
  const startAutoSlide = useCallback(() => {
    clearTimeout(autoSlideTimer.current);
    autoSlideTimer.current = setTimeout(() => {
      goTo((active + 1) % items.length, 1);
    }, PREVIEW_DURATION);
  }, [active, goTo]);

  const stopAutoSlide = useCallback(() => {
    clearTimeout(autoSlideTimer.current);
  }, []);

  // Start/stop auto-slide based on mode
  useEffect(() => {
    if (mode === "preview") {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }
    return () => stopAutoSlide();
  }, [mode, active, startAutoSlide, stopAutoSlide]);

  // ── Play/pause center video on active or mode change ────────────────────
  useEffect(() => {
    const centerId = items[active].id;

    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (!videoEl) return;
      const numId = Number(id);
      if (numId === centerId) {
        if (isInViewRef.current) {
          // Always reset to start in preview mode; continue from current pos in watching mode
          if (mode === "preview") videoEl.currentTime = 0;
          safePlay(videoEl);
        }
      } else {
        safePause(videoEl, true);
      }
    });
  }, [active, mode]);

  // ── IntersectionObserver — pause when scrolled out of view ──────────────
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
          safePlay(centerVideo);
          if (mode === "preview") startAutoSlide();
        } else {
          safePause(centerVideo);
          stopAutoSlide();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(carousel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mode]);

  // When user manually changes slide, reset to preview mode
  const handleManualNav = useCallback((indexOrFn, dir) => {
    setMode("preview");
    if (typeof indexOrFn === "function") {
      setDirection(dir);
      setActive(indexOrFn);
    } else {
      goTo(indexOrFn, dir);
    }
  }, [goTo]);

  // ── Click handler on center video ───────────────────────────────────────
  const handleVideoClick = useCallback((e, itemId, itemOffset) => {
    const video = e.currentTarget;
    const centerId = items[active].id;

    // Clicking a non-center card — navigate to it and resume preview
    if (itemId !== centerId) {
      const newIndex = (active + itemOffset + items.length) % items.length;
      handleManualNav(newIndex, itemOffset > 0 ? 1 : -1);
      return;
    }

    // Clicking the center card
    if (mode === "preview") {
      setMode("watching");
    } else {
      if (video.paused) {
        safePlay(video);
      } else {
        safePause(video);
      }
    }
  }, [active, mode, handleManualNav]);

  // ── Framer variants ──────────────────────────────────────────────────────
  const slideVariants = {
    enter: () => ({ opacity: 0, scale: 0.8 }),
    center: {
      opacity: 1, scale: 1,
      transition: { scale: { type: "spring", stiffness: 200, damping: 20 }, opacity: { duration: 0.2 } },
    },
    exit: () => ({ opacity: 0, scale: 0.8 }),
  };

  const contentVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  const getVisibleItems = () => {
    const total = items.length;
    return [-2, -1, 0, 1, 2].map((offset) => ({
      ...items[(active + offset + total) % total],
      offset,
    }));
  };

  return (
    <div ref={carouselRef} className="relative mx-auto px-4 w-full">
      {/* Prev Arrow */}
      <button
        onClick={() => handleManualNav((active - 1 + items.length) % items.length, -1)}
        className="top-1/2 left-2 md:left-10 lg:left-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <img className="opacity-[100%] -rotate-180" src="/back.png" alt="previous" />
        </div>
      </button>

      {/* Next Arrow */}
      <button
        onClick={() => handleManualNav((active + 1) % items.length, 1)}
        className="top-1/2 right-2 md:right-10 lg:right-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <img className="opacity-[100%]" src="/back.png" alt="next" />
        </div>
      </button>

      {/* Carousel track */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={true}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) handleManualNav((active + 1) % items.length, 1);
          else if (info.offset.x > 50) handleManualNav((active - 1 + items.length) % items.length, -1);
        }}
        className="flex flex-nowrap justify-center items-center gap-2 h-[420px] overflow-hidden"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {getVisibleItems().map((item) => {
            const pos = item.offset === 0 ? "center" : Math.abs(item.offset) === 1 ? "side" : "edge";
            const { h, w } = tileSizes[pos];
            const isCenter = item.offset === 0;
            const isWatching = isCenter && mode === "watching";

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
                      applyIOSInlineAttributes(el);
                      el.onended = () => {
                        if (isCenter && mode === "watching") {
                          // After full video ends, switch back to preview and advance
                          setMode("preview");
                          goTo((active + 1) % items.length, 1);
                        } else {
                          el.currentTime = 0;
                          if (isInViewRef.current) safePlay(el);
                        }
                      };
                    } else {
                      delete videoRefs.current[item.id];
                    }
                  }}
                  onClick={(e) => handleVideoClick(e, item.id, item.offset)}
                  poster={item.poster}
                  muted={isMuted}
                  playsInline
                  className="relative rounded-md w-full h-full object-cover cursor-pointer"
                >
                  <source src={item.img} type="video/mp4" />
                </video>

                {/* Progress bar — only in preview mode on center video */}
                {isCenter && mode === "preview" && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/30 rounded-b-md overflow-hidden">
                    <motion.div
                      key={`progress-${active}`}
                      className="h-full bg-filgreen"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: PREVIEW_DURATION / 1000, ease: "linear" }}
                    />
                  </div>
                )}

                {/* Mute/unmute — center video only */}
                {isCenter && (
                  <div className="absolute right-3 bottom-6 z-10">
                    {!isMuted ? (
                      <Volume2 size={20} color="#fff" className="cursor-pointer drop-shadow" onClick={() => setIsMuted(true)} />
                    ) : (
                      <VolumeX size={20} color="#fff" className="cursor-pointer drop-shadow" onClick={() => setIsMuted(false)} />
                    )}
                  </div>
                )}

                {/* "Tap to watch" hint — preview mode center only */}
                {isCenter && mode === "preview" && (
                  <motion.div
                    className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap">
                      Tap to watch full video
                    </span>
                  </motion.div>
                )}

                {/* Play overlay — non-center videos */}
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
            onClick={() => handleManualNav(idx, idx > active ? 1 : idx < active ? -1 : 0)}
            className={`transition-all rounded-md ${
              idx === active ? "bg-filgreen w-5 h-[6px]" : "bg-[#b7b7b7] w-[10px] h-[6px]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}