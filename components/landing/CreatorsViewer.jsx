"use client";

// Full-screen player for the Creators section, built on the shared swipe shell. Loaded on demand
// from Creators.jsx.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import {
  applyIOSInlineAttributes,
  exitFullscreen,
  formatPrice,
  productHref,
  ProductThumb,
  safePause,
  safePlay,
} from "./creatorsShared";
import { EndSlide, SLIDE_CLASS, TRACK_CLASS, useSwipeViewer, ViewerArrows, ViewerButton, ViewerTopBar } from "./swipeViewer";

export default function CreatorsViewer({ items, startIndex, onClose }) {
  const videoRefs = useRef([]);
  const progressRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const mutedRef = useRef(false);

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

  const { trackRef, slideRef, active, activeRef, goTo, close } = useSwipeViewer({
    count: items.length,
    startIndex,
    onClose,
    onKey: (e) => {
      if (e.key !== " ") return;
      e.preventDefault();
      togglePlay();
    },
  });

  const togglePlay = () => {
    const video = videoRefs.current[activeRef.current];
    if (!video) return;
    if (video.paused) playActive(video);
    else safePause(video);
  };

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    const video = videoRefs.current[activeRef.current];
    if (video) video.muted = next;
  };

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v && i !== active) safePause(v, true);
    });
    setPaused(false);
    const video = videoRefs.current[active];
    if (video) playActive(video);
  }, [active, playActive]);

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
      <div ref={trackRef} className={TRACK_CLASS}>
        {items.map((item, i) => {
          const isActive = i === active;
          // Only the current video and its neighbours get a <video>; the rest stay as posters
          const mountVideo = Math.abs(i - active) <= 1;
          const isCampaign = item.type === "campaign";

          return (
            <div
              key={item.id}
              ref={slideRef(i)}
              data-index={i}
              onClick={() => isActive && togglePlay()}
              className={SLIDE_CLASS}
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

        <EndSlide count={items.length} slideRef={slideRef} />
      </div>

      <ViewerTopBar count={items.length} active={active} progressRef={progressRef} onClose={close}>
        <ViewerButton onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </ViewerButton>
      </ViewerTopBar>

      <ViewerArrows count={items.length} active={active} goTo={goTo} />
    </motion.div>
  );
}
