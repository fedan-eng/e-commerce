"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Maximize2, X } from "lucide-react";

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

function safePlay(videoEl) {
  const p = videoEl.play();
  videoEl._pendingPlay = p;
  if (p !== undefined) p.catch(() => {});
}

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

function applyIOSInlineAttributes(el) {
  if (!el) return;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.setAttribute("x5-playsinline", "");
  el.setAttribute("x5-video-player-type", "h5");
  el.setAttribute("x5-video-player-fullscreen", "false");
}

export default function Creators() {
  const [active, setActive] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreenMuted, setIsFullscreenMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [playingId, setPlayingId] = useState(null);

  const videoRefs = useRef({});
  const fullscreenVideoRef = useRef(null);

  // Responsive cards count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCardsToShow(1);
      else if (window.innerWidth < 768) setCardsToShow(2);
      else if (window.innerWidth < 1024) setCardsToShow(3);
      else setCardsToShow(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, items.length - cardsToShow);

  const next = () => setActive((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prev = () => setActive((prev) => (prev <= 0 ? maxIndex : prev - 1));

  const pauseAllExcept = useCallback((id) => {
    Object.entries(videoRefs.current).forEach(([vid, el]) => {
      if (!el) return;
      if (Number(vid) !== id) safePause(el, true);
    });
  }, []);

  const handlePlayClick = (item) => {
    const el = videoRefs.current[item.id];
    if (!el) return;

    if (playingId === item.id) {
      if (el.paused) safePlay(el);
      else {
        safePause(el);
        setPlayingId(null);
      }
    } else {
      pauseAllExcept(item.id);
      el.currentTime = item.previewStart ?? 0;
      safePlay(el);
      setPlayingId(item.id);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach((el) => {
        if (el) safePause(el);
      });
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeItem = items[Math.min(active, items.length - 1)];

  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 md:mb-10 tracking-tight">
          Your Faves Fave
        </h2>

        {/* Carousel */}
        <div className="relative">
          
          {/* Left Arrow */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-3 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-3 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all"
            aria-label="Next"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          {/* Track */}
          <div className="overflow-hidden mx-2 sm:mx-4">
            <motion.div
              className="flex gap-3 md:gap-4"
              animate={{ x: `-${active * (100 / cardsToShow)}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
            >
              {items.map((item) => {
                const isPlaying = playingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm"
                    style={{ width: `${100 / cardsToShow}%` }}
                  >
                    <div className="relative w-full aspect-[9/16]">
                      
                      <video
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[item.id] = el;
                            applyIOSInlineAttributes(el);
                          }
                        }}
                        poster={item.poster}
                        muted={isMuted}
                        playsInline
                        loop
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover"
                        onClick={() => handlePlayClick(item)}
                      >
                        <source src={item.img} type="video/mp4" />
                      </video>

                      {/* Bottom gradient */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                      {/* Center Play Button */}
                      {!isPlaying && (
                        <button
                          onClick={() => handlePlayClick(item)}
                          className="absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-black/60 hover:scale-105 transition-all z-10"
                          aria-label="Play video"
                        >
                          <Play size={22} className="text-white fill-white ml-0.5" />
                        </button>
                      )}

                      {/* Mute */}
                      {isPlaying && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted((m) => !m);
                          }}
                          className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          {isMuted ? (
                            <VolumeX size={14} className="text-white" />
                          ) : (
                            <Volume2 size={14} className="text-white" />
                          )}
                        </button>
                      )}

                      {/* Fullscreen */}
                      {isPlaying && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(true);
                          }}
                          className="absolute bottom-3 left-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          <Maximize2 size={14} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === idx ? "bg-gray-900 w-5" : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullscreen(false);
            }}
          >
            <motion.div
              className="relative w-full max-w-sm md:max-w-md rounded-xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <video
                ref={fullscreenVideoRef}
                key={activeItem.id}
                src={activeItem.img}
                poster={activeItem.poster}
                muted={isFullscreenMuted}
                playsInline
                controls
                autoPlay
                className="w-full h-auto max-h-[85vh] object-contain bg-black"
              />

              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-white" />
              </button>

              <button
                onClick={() => setIsFullscreenMuted((m) => !m)}
                className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center"
              >
                {isFullscreenMuted ? (
                  <VolumeX size={16} className="text-white" />
                ) : (
                  <Volume2 size={16} className="text-white" />
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}