"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { applyIOSInlineAttributes, enterFullscreen, ProductPill, safePause, safePlay } from "./creatorsShared";

// The player only downloads once the section is near the screen (see the `near` effect)
const CreatorsViewer = dynamic(() => import("./CreatorsViewer"), { ssr: false });

// previewStart/previewEnd mark each video's peak seconds for the muted autoplay preview.
// `preview` (optional) is a short pre-cut clip of those seconds, which loads much faster than
// seeking into the full video; when it's set, previewStart/previewEnd are ignored.
// TODO: real peak ranges, and product ids/thumbs/prices (id: null links to the category page).
const items = [
  {
    id: 1,
    type: "campaign",
    badge: "Campaign Film",
    title: "Light can go. You stay on.",
    duration: "1:20",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/magflex.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/magflex-thumb.png",
    previewStart: 0,
    previewEnd: 6,
    product: { id: null, name: "MagFlex", href: "/products/power-banks", thumb: null, price: null },
  },
  {
    id: 2,
    type: "creator",
    badge: "Creator",
    badgeColor: "bg-[#00E575]", // Bright Green
    title: "So if you've been seeing",
    description: "Honest review, no script",
    handle: "@peacelucci",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/dammy-2.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/dammy-2-thumb.png",
    previewStart: 0,
    previewEnd: 6,
    product: { id: null, name: "MagFlex", href: "/products/power-banks", thumb: null, price: null },
  },
  {
    id: 3,
    type: "creator",
    badge: "Creator",
    badgeColor: "bg-[#C49BFF]", // Purple
    title: "Honest review...",
    description: "no script",
    handle: "@papeeyah",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/papeetyah.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/papeetyah-thumb.png",
    previewStart: 87,
    previewEnd: 93,
    product: { id: null, name: "MagFlex", href: "/products/power-banks", thumb: null, price: null },
  },
  {
    id: 4,
    type: "creator",
    badge: "Creator",
    badgeColor: "bg-[#FFD166]", // Yellow
    title: "Thunder Power Bank test",
    description: "Charge speed test",
    handle: "@techguy",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/thunder-power-bank.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/thunder-power-bank-thumb.png",
    previewStart: 0,
    previewEnd: 6,
    product: { id: null, name: "Thunder Power Bank", href: "/products/power-banks", thumb: null, price: null },
  },
];

const PREVIEW_SECONDS = 6;
const STALL_MS = 4000; // skip a card whose preview hasn't started by then (slow network, autoplay blocked)
const TOUCH_RESUME_MS = 2500; // after a manual swipe, wait this long before the cycle carries on
const WIDTH_TRANSITION_MS = 500;

const ACTIVE_WIDTH = "w-[85vw] max-w-[700px] sm:w-[600px] lg:w-[700px]";
const IDLE_WIDTH = "w-[42vw] max-w-[220px] sm:max-w-none sm:w-[260px] lg:w-[280px]";

// The #t= fragment makes the browser start the full video at the peak instead of 0:00
function previewWindow(item) {
  if (item.preview) return { src: item.preview, start: 0, end: Infinity };
  const start = item.previewStart ?? 0;
  return { src: `${item.img}#t=${start}`, start, end: item.previewEnd ?? start + PREVIEW_SECONDS };
}

export default function Creators() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveIndex, setLiveIndex] = useState(null); // the card whose preview is actually playing
  const [loaded, setLoaded] = useState(() => new Set()); // cards whose preview video has been attached
  const [near, setNear] = useState(false); // section is close to the screen: start loading
  const [inView, setInView] = useState(false); // section is on screen: run the previews
  const [pageVisible, setPageVisible] = useState(true);
  const [held, setHeld] = useState(false); // finger on the row
  const [autoplayAllowed, setAutoplayAllowed] = useState(true);
  const [viewerIndex, setViewerIndex] = useState(null);

  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const videoRefs = useRef([]);
  const progressRefs = useRef([]);
  const stallTimer = useRef(null);
  const touchTimer = useRef(null);
  const activeRef = useRef(0);
  const heldRef = useRef(false);
  activeRef.current = activeIndex;
  heldRef.current = held;

  const running = near && inView && pageVisible && !held && autoplayAllowed && viewerIndex === null;

  const goTo = useCallback((i) => {
    if (i === activeRef.current) return;
    setLiveIndex(null);
    setActiveIndex(i);
  }, []);

  const advance = useCallback(() => goTo((activeRef.current + 1) % items.length), [goTo]);

  // Nothing loads until the section is within 300px of the screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        nearObs.disconnect();
      }
    }, { rootMargin: "300px 0px" });
    const viewObs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    nearObs.observe(el);
    viewObs.observe(el);
    return () => {
      nearObs.disconnect();
      viewObs.disconnect();
    };
  }, []);

  // Reduced motion or data saver: posters only, no autoplay
  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoplayAllowed(!motion.matches && !navigator.connection?.saveData);
    sync();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", sync);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", sync);
    };
  }, []);

  // Fetch the player's code early so the first tap opens it straight away
  useEffect(() => {
    if (near) import("./CreatorsViewer");
  }, [near]);

  // Attach the active card's video and the next one's, so the hand-off is smooth
  useEffect(() => {
    if (!near || !autoplayAllowed) return;
    const next = (activeIndex + 1) % items.length;
    setLoaded((prev) => (prev.has(activeIndex) && prev.has(next) ? prev : new Set(prev).add(activeIndex).add(next)));
  }, [near, autoplayAllowed, activeIndex]);

  const activeHasVideo = loaded.has(activeIndex);
  useEffect(() => {
    const video = videoRefs.current[activeIndex];
    if (!running || !activeHasVideo || !video) return;
    const { start, end } = previewWindow(items[activeIndex]);
    if (video.readyState > 0 && (video.currentTime < start || video.currentTime >= end)) {
      video.currentTime = start;
    }
    safePlay(video);
    stallTimer.current = setTimeout(advance, STALL_MS);
    return () => {
      clearTimeout(stallTimer.current);
      safePause(video);
    };
  }, [running, activeIndex, activeHasVideo, advance]);

  // Once the active card has finished widening, scroll the row only as far as needed to show it all
  useEffect(() => {
    if (heldRef.current) return;
    const t = setTimeout(() => {
      const row = scrollContainerRef.current;
      const card = cardRefs.current[activeIndex];
      if (!row || !card) return;
      const pad = 16;
      const left = card.offsetLeft - pad;
      const right = card.offsetLeft + card.offsetWidth + pad - row.clientWidth;
      if (row.scrollLeft > left) row.scrollTo({ left, behavior: "smooth" });
      else if (row.scrollLeft < right) row.scrollTo({ left: right, behavior: "smooth" });
    }, WIDTH_TRANSITION_MS + 20);
    return () => clearTimeout(t);
  }, [activeIndex]);

  useEffect(() => () => {
    clearTimeout(stallTimer.current);
    clearTimeout(touchTimer.current);
  }, []);

  const onPreviewTime = (i, video) => {
    if (i !== activeIndex) return;
    const { start, end } = previewWindow(items[i]);
    const stop = Number.isFinite(end) ? end : video.duration;
    const bar = progressRefs.current[i];
    if (bar && stop > start) {
      const pct = Math.min(1, Math.max(0, (video.currentTime - start) / (stop - start)));
      bar.style.transform = `scaleX(${pct})`;
    }
    if (video.currentTime >= end) advance();
  };

  // Swiping the row by hand pauses the cycle; when they let go, the card they swiped to plays next
  const holdForTouch = () => {
    clearTimeout(touchTimer.current);
    setHeld(true);
  };
  const releaseAfterTouch = () => {
    clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => {
      const row = scrollContainerRef.current;
      if (row) {
        const i = cardRefs.current.findIndex((c) => c && c.offsetLeft + c.offsetWidth / 2 > row.scrollLeft);
        if (i >= 0) goTo(i);
      }
      setHeld(false);
    }, TOUCH_RESUME_MS);
  };

  const openViewer = (i) => {
    enterFullscreen();
    setViewerIndex(i);
  };

  // Hand the highlight to whichever video they were watching last
  const closeViewer = useCallback((lastIndex) => {
    setViewerIndex(null);
    goTo(lastIndex);
  }, [goTo]);

  return (
    <section ref={sectionRef} className="w-full bg-[#082C17] py-10 md:py-24 overflow-hidden text-white font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-[24px] sm:text-[32px] md:text-[40px] leading-tight font-bold tracking-tight mb-1 sm:mb-2">
            Your Faves Fave
          </h2>
          <p className="text-gray-300 text-[13px] sm:text-base max-w-2xl leading-relaxed mb-4 sm:mb-6">
            Demos, creator reviews and behind-the-scenes from our team.<br className="hidden sm:block"/>
            Real people using real gear, no studio magic.
          </p>

          <div className="flex items-end justify-between gap-4">
            {/* Navigation Arrows */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => goTo((activeIndex - 1 + items.length) % items.length)}
                aria-label="Previous video"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors group"
              >
                <ChevronLeft size={18} strokeWidth={2} className="text-white" />
              </button>
              <button
                onClick={advance}
                aria-label="Next video"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors group"
              >
                <ChevronRight size={18} strokeWidth={2} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          onTouchStart={holdForTouch}
          onTouchEnd={releaseAfterTouch}
          onTouchCancel={releaseAfterTouch}
          className="relative flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-proximity pb-4 sm:pb-8 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0"
        >
          {items.map((item, i) => {
            const isActive = i === activeIndex;
            const isLive = isActive && liveIndex === i;
            const isCampaign = item.type === "campaign";

            return (
              <div
                key={item.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                role="button"
                tabIndex={0}
                aria-label={`Watch: ${item.title}`}
                onClick={() => openViewer(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openViewer(i);
                  }
                }}
                className={`relative flex-shrink-0 snap-start rounded-[20px] sm:rounded-[32px] overflow-hidden bg-[#0D4024] shadow-lg cursor-pointer group transition-[width] duration-500 ease-out h-[75vw] max-h-[390px] sm:h-[460px] sm:max-h-none lg:h-[500px] ${
                  isActive ? ACTIVE_WIDTH : IDLE_WIDTH
                }`}
              >
                {/* Blurred fill either side of a portrait video once its card is wide */}
                {!isCampaign && (
                  <img
                    src={item.poster}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover scale-110 blur-2xl transition-opacity duration-500 ${isActive ? "opacity-60" : "opacity-0"}`}
                  />
                )}

                {/* An <img> rather than the video's poster attribute, so it can lazy-load */}
                <img
                  src={item.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isCampaign ? "object-top" : ""} ${isLive ? "opacity-0" : "opacity-100"}`}
                />

                {loaded.has(i) && (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                      if (el) {
                        el.muted = true;
                        applyIOSInlineAttributes(el);
                      }
                    }}
                    src={previewWindow(item).src}
                    muted
                    playsInline
                    preload={isActive ? "auto" : "metadata"}
                    onPlaying={() => {
                      if (i !== activeIndex) return;
                      clearTimeout(stallTimer.current);
                      setLiveIndex(i);
                    }}
                    onTimeUpdate={(e) => onPreviewTime(i, e.currentTarget)}
                    onEnded={() => i === activeIndex && advance()}
                    className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${isCampaign ? "object-cover object-top" : "object-contain"} ${isLive ? "opacity-100" : "opacity-0"}`}
                  />
                )}

                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Overlays & Badges */}
                <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-6 pointer-events-none">
                  <div className="flex justify-between items-start w-full">
                    <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[12px] font-bold text-gray-900 leading-none ${
                      isCampaign ? "bg-white" : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="flex items-end justify-between gap-2 sm:gap-4 w-full relative z-10">
                    <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                      {item.product && <ProductPill product={item.product} className="mb-1 sm:mb-1.5" />}
                      <h3 className={`font-bold leading-tight line-clamp-2 ${isCampaign ? "text-lg sm:text-2xl" : "text-[14px] sm:text-[18px]"}`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-white/80 text-[11px] sm:text-[13px] leading-snug line-clamp-2 sm:line-clamp-none">
                          {item.description}
                        </p>
                      )}
                      {item.handle && (
                        <p className="text-white/60 text-[10.5px] sm:text-[12px] mt-0.5 sm:mt-1 truncate">
                          {item.handle}
                        </p>
                      )}
                      {item.duration && (
                        <p className="text-white/80 text-[12px] sm:text-[14px] mt-1">
                          {item.duration}
                        </p>
                      )}
                    </div>

                    <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-[#00E575] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play size={16} className="text-[#082C17] fill-[#082C17] ml-0.5 sm:ml-1" />
                    </div>
                  </div>
                </div>

                {/* How far through its preview the active card is */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15 pointer-events-none">
                    <div
                      ref={(el) => { progressRefs.current[i] = el; }}
                      className="h-full w-full origin-left bg-[#00E575]"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {viewerIndex !== null && (
          <CreatorsViewer key="viewer" items={items} startIndex={viewerIndex} onClose={closeViewer} />
        )}
      </AnimatePresence>
    </section>
  );
}
