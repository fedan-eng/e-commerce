"use client";

// Full-screen player for the Creators section: one video per screen, swipe (or arrow keys) between
// them like Stories, and swiping past the last one closes it. Loaded on demand from Creators.jsx.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, X } from "lucide-react";
import {
  applyIOSInlineAttributes,
  exitFullscreen,
  formatPrice,
  fullscreenElement,
  productHref,
  ProductThumb,
  safePause,
  safePlay,
} from "./creatorsShared";

export default function CreatorsViewer({ items, startIndex, onClose }) {
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const videoRefs = useRef([]);
  const progressRef = useRef(null);
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const mutedRef = useRef(false);
  const activeRef = useRef(startIndex);
  const closedRef = useRef(false);
  activeRef.current = active;

  const close = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    exitFullscreen();
    onClose(activeRef.current);
  }, [onClose]);

  // Index items.length is the empty slide after the last video; landing on it closes the player
  const goTo = useCallback((i) => {
    const track = trackRef.current;
    if (!track || i < 0) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }, []);

  const playActive = useCallback((video) => {
    video.muted = mutedRef.current;
    const p = video.play();
    video._pendingPlay = p;
    p?.catch((err) => {
      // Some browsers refuse sound without a fresh tap: carry on muted rather than show a frozen frame
      if (err?.name !== "NotAllowedError" || video.muted) return;
      mutedRef.current = true;
      setMuted(true);
      video.muted = true;
      safePlay(video);
    });
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRefs.current[activeRef.current];
    if (!video) return;
    if (video.paused) playActive(video);
    else safePause(video);
  }, [playActive]);

  const toggleMute = (e) => {
    e.stopPropagation();
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    const video = videoRefs.current[activeRef.current];
    if (video) video.muted = next;
  };

  // Open on the video that was tapped, before the first paint
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = startIndex * track.clientWidth;
  }, [startIndex]);

  // Whichever slide is mostly on screen is the one that plays
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number(e.target.dataset.index);
        if (i === items.length) close();
        else setActive(i);
      });
    }, { root: trackRef.current, threshold: 0.6 });
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length, close]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v && i !== active) safePause(v, true);
    });
    setPaused(false);
    const video = videoRefs.current[active];
    if (video) playActive(video);
  }, [active, playActive]);

  // Leaving browser fullscreen (Esc, Android back) closes the player too, so there's only one exit.
  // Fullscreen is exited in close(), not on unmount: StrictMode's mount/unmount/mount would drop it.
  useEffect(() => {
    let wasFullscreen = Boolean(fullscreenElement());
    const onChange = () => {
      if (fullscreenElement()) wasFullscreen = true;
      else if (wasFullscreen) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") goTo(activeRef.current + 1);
      else if (e.key === "ArrowLeft") goTo(activeRef.current - 1);
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevOverflow;
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [close, goTo, togglePlay]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Creator videos"
      className="fixed inset-0 z-[9999] h-[100dvh] bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        ref={trackRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          // Only the current video and its neighbours get a <video>; the rest stay as posters
          const mountVideo = Math.abs(i - active) <= 1;
          const isCampaign = item.type === "campaign";

          return (
            <div
              key={item.id}
              ref={(el) => { slideRefs.current[i] = el; }}
              data-index={i}
              onClick={() => isActive && togglePlay()}
              className="relative flex h-full w-full shrink-0 snap-center snap-always items-center justify-center overflow-hidden"
            >
              <img
                src={item.poster}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-3xl"
              />

              {mountVideo ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                    if (el) applyIOSInlineAttributes(el);
                  }}
                  src={item.img}
                  poster={item.poster}
                  playsInline
                  preload={isActive ? "auto" : "metadata"}
                  onPlay={() => i === activeRef.current && setPaused(false)}
                  onPause={(e) => i === activeRef.current && !e.currentTarget.ended && setPaused(true)}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (i === activeRef.current && progressRef.current && v.duration) {
                      progressRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
                    }
                  }}
                  onEnded={() => goTo(i + 1)}
                  className="relative h-full w-full object-contain"
                />
              ) : (
                <img src={item.poster} alt="" className="relative h-full w-full object-contain" />
              )}

              {isActive && paused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-md">
                    <Play size={28} className="ml-1 fill-white text-white" />
                  </div>
                </div>
              )}

              {/* Caption and product, kept to the video's own width on wide screens */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-24 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
                <div className={`mx-auto w-full ${isCampaign ? "max-w-3xl" : "max-w-[calc(100dvh*9/16)]"}`}>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold leading-none text-gray-900 ${isCampaign ? "bg-white" : item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <h3 className="mt-2 text-lg font-bold leading-tight sm:text-xl">{item.title}</h3>
                  {(item.handle || item.description) && (
                    <p className="mt-0.5 truncate text-[13px] text-white/70">
                      {[item.handle, item.description].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {isActive && item.product && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.4 }}
                      className="mt-3"
                    >
                      <Link
                        href={productHref(item.product)}
                        onClick={(e) => {
                          e.stopPropagation();
                          exitFullscreen();
                        }}
                        className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl transition-colors hover:bg-white/15 sm:max-w-sm"
                      >
                        <ProductThumb product={item.product} className="h-11 w-11 rounded-xl" iconSize={18} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] uppercase tracking-wide text-white/60">In this video</span>
                          <span className="block truncate text-sm font-semibold">{item.product.name}</span>
                          {item.product.price != null && (
                            <span className="block text-xs text-white/70">{formatPrice(item.product.price)}</span>
                          )}
                        </span>
                        <span className="shrink-0 rounded-xl bg-[#00E575] px-4 py-2 text-sm font-bold text-[#082C17]">Shop</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div
          ref={(el) => { slideRefs.current[items.length] = el; }}
          data-index={items.length}
          aria-hidden
          className="flex h-full w-full shrink-0 snap-center items-center justify-center text-sm text-white/50"
        >
          That&apos;s all for now
        </div>
      </div>

      {/* Story-style progress, mute and close */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-3 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <div className="mx-auto flex max-w-3xl gap-1">
          {items.map((item, i) => (
            <div key={item.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              {/* Re-keyed when it becomes or stops being the active one, so stale progress never sticks */}
              <div
                key={i === active ? "active" : "idle"}
                ref={i === active ? progressRef : undefined}
                className="h-full w-full origin-left bg-white"
                style={{ transform: `scaleX(${i < active ? 1 : 0})` }}
              />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-3 flex max-w-3xl items-center justify-end gap-2">
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-colors hover:bg-black/70"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={close}
            aria-label="Close"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-colors hover:bg-black/70"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Desktop arrows; on touch screens you swipe */}
      {active > 0 && (
        <button
          onClick={() => goTo(active - 1)}
          aria-label="Previous video"
          className="absolute left-6 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20 md:flex"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <button
        onClick={() => goTo(active + 1)}
        aria-label={active === items.length - 1 ? "Close" : "Next video"}
        className="absolute right-6 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20 md:flex"
      >
        <ChevronRight size={22} />
      </button>
    </motion.div>
  );
}
