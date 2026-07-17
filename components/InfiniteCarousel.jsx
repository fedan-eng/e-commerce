"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";

const items = [
  {
    id: 1,
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/magflex.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/magflex-thumb.png",
    previewStart: 0,
  },
  {
    id: 2,
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/dammy-2.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/dammy-2-thumb.png",
    previewStart: 0,
  },
  {
    id: 3,
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/dammy-1.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/dammy-1-thumb.png",
    previewStart: 0,
  }, 
  {
    id: 4,
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/papeetyah.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/papeetyah-thumb.png",
    previewStart: 87,
  },
  {
    id: 5,
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/thunder-power-bank.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/thunder-power-bank-thumb.png",
    previewStart: 0,
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
  const [isFullscreenMuted, setIsFullscreenMuted] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // "preview" = auto-sliding mode | "watching" = user clicked, stay on this video
  const [mode, setMode] = useState("preview");

  const videoRefs = useRef({});
  const carouselRef = useRef(null);
  const isInViewRef = useRef(true);
  const autoSlideTimer = useRef(null);
  const progressRef = useRef(null); // for the progress bar animation
  const fullscreenVideoRef = useRef(null);

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
    const centerItem = items[active];

    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (!videoEl) return;
      const numId = Number(id);
      if (numId === centerId) {
        if (isInViewRef.current) {
          if (mode === "preview") {
            videoEl.currentTime = centerItem.previewStart ?? 0;
          }
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

  // ── Fullscreen Modal ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Pause carousel and stop auto-slide when fullscreen opens, resume when closes
  useEffect(() => {
    const centerId = items[active].id;
    const centerVideo = videoRefs.current[centerId];

    if (isFullscreen) {
      stopAutoSlide();
      if (centerVideo) safePause(centerVideo);
    } else {
      if (centerVideo && isInViewRef.current) safePlay(centerVideo);
      if (mode === "preview") startAutoSlide();
    }
  }, [isFullscreen, mode, startAutoSlide, stopAutoSlide]);

  const activeItem = items[active];

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
          <ChevronLeft size={32} color="white" className="opacity-[100%]" />
        </div>
      </button>

      {/* Next Arrow */}
      <button
        onClick={() => handleManualNav((active + 1) % items.length, 1)}
        className="top-1/2 right-2 md:right-10 lg:right-20 z-50 absolute -translate-y-1/2"
      >
        <div className="flex justify-center items-center bg-black opacity-[48%] hover:opacity-[100%] rounded-full w-[50px] h-[50px]">
          <ChevronRight size={32} color="white" className="opacity-[100%]" />
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
                          setMode("preview");
                          goTo((active + 1) % items.length, 1);
                        } else {
                          el.currentTime = item.previewStart ?? 0;
                          if (isInViewRef.current) safePlay(el);
                        }
                      };

                      el.ontimeupdate = () => {
                        if (mode === "preview" && isCenter && !isFullscreen) {
                          const start = item.previewStart ?? 0;
                          if (el.currentTime >= start + PREVIEW_DURATION / 1000) {
                            safePause(el, false);
                            goTo((active + 1) % items.length, 1);
                          }
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

                {/* Fullscreen icon — center video only */}
                {isCenter && (
                  <div className="absolute left-3 bottom-6 z-10">
                    <Maximize2
                      size={20}
                      color="#fff"
                      className="cursor-pointer drop-shadow"
                      onClick={() => setIsFullscreen(true)}
                    />
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
                  <Image src="/play.svg" width={24} height={24} alt="play" />
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

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsFullscreen(false); }}
          >
            <motion.div
              className="relative w-full max-w-sm md:max-w-md lg:max-w-lg rounded-xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <video
                ref={fullscreenVideoRef}
                key={activeItem.id}
                src={activeItem.img}
                poster={activeItem.poster}
                muted={isFullscreenMuted}
                playsInline
                controls
                className="w-full h-auto max-h-[85vh] object-contain bg-black"
                onLoadedMetadata={() => {
                  if (fullscreenVideoRef.current) {
                    fullscreenVideoRef.current.currentTime = 0;
                    fullscreenVideoRef.current.play().catch(() => {});
                  }
                }}
                onEnded={() => {
                  setIsFullscreen(false);
                  goTo((active + 1) % items.length, 1);
                }}
              />

              {/* Close button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 transition-colors"
              >
                <X size={20} color="white" />
              </button>

              {/* Mute toggle inside modal */}
              <div className="absolute bottom-4 right-4 z-10">
                {!isFullscreenMuted ? (
                  <Volume2 size={20} color="#fff" className="cursor-pointer drop-shadow" onClick={() => setIsFullscreenMuted(true)} />
                ) : (
                  <VolumeX size={20} color="#fff" className="cursor-pointer drop-shadow" onClick={() => setIsFullscreenMuted(false)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}