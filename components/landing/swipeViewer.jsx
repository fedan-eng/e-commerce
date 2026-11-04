"use client";

// The swipe-through, Stories-style full-screen shell shared by the creator videos and the WhatsApp
// review screenshots: one item per screen, swipe or arrow keys between them, and swiping past the
// last one closes it. Each viewer renders its own slides and controls on top.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { exitFullscreen, fullscreenElement } from "./creatorsShared";

export const TRACK_CLASS =
  "flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
export const SLIDE_CLASS = "relative flex h-full w-full shrink-0 snap-center snap-always items-center justify-center overflow-hidden";

// onKey handles any extra keys (Escape and the arrows are taken care of here)
export function useSwipeViewer({ count, startIndex, onClose, onKey }) {
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const [active, setActive] = useState(startIndex);
  const activeRef = useRef(startIndex);
  const closedRef = useRef(false);
  const onKeyRef = useRef(onKey);
  activeRef.current = active;
  onKeyRef.current = onKey;

  const close = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    exitFullscreen();
    onClose(activeRef.current);
  }, [onClose]);

  // Index `count` is the empty slide after the last item; landing on it closes the viewer
  const goTo = useCallback((i) => {
    const track = trackRef.current;
    if (!track || i < 0) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }, []);

  const slideRef = (i) => (el) => {
    slideRefs.current[i] = el;
  };

  // Open on the item that was tapped, before the first paint
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = startIndex * track.clientWidth;
  }, [startIndex]);

  // Whichever slide is mostly on screen is the active one
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number(e.target.dataset.index);
        if (i === count) close();
        else setActive(i);
      });
    }, { root: trackRef.current, threshold: 0.6 });
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count, close]);

  // Leaving browser fullscreen (Esc, Android back) closes the viewer too, so there's only one exit.
  // Fullscreen is exited in close(), not on unmount: StrictMode's mount/unmount/mount would drop it.
  useEffect(() => {
    let wasFullscreen = Boolean(fullscreenElement());
    const onChange = () => {
      if (fullscreenElement()) wasFullscreen = true;
      else if (wasFullscreen) close();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") goTo(activeRef.current + 1);
      else if (e.key === "ArrowLeft") goTo(activeRef.current - 1);
      else onKeyRef.current?.(e);
    };
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    window.addEventListener("keydown", handleKey);
    return () => {
      html.style.overflow = prevOverflow;
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      window.removeEventListener("keydown", handleKey);
    };
  }, [close, goTo]);

  return { trackRef, slideRef, active, activeRef, goTo, close };
}

export function EndSlide({ count, slideRef }) {
  return (
    <div
      ref={slideRef(count)}
      data-index={count}
      aria-hidden
      className="flex h-full w-full shrink-0 snap-center items-center justify-center text-sm text-white/50"
    >
      That&apos;s all for now
    </div>
  );
}

const roundButton =
  "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-colors hover:bg-black/70";

// Progress dashes, then any extra buttons (children) and the close button.
// progressRef, when given, is attached to the active dash so a video can fill it as it plays.
export function ViewerTopBar({ count, active, progressRef, onClose, children }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-3 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mx-auto flex max-w-3xl gap-1">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
            {/* Re-keyed when it becomes or stops being the active one, so stale progress never sticks */}
            <div
              key={i === active ? "active" : "idle"}
              ref={i === active ? progressRef : undefined}
              className="h-full w-full origin-left bg-white"
              style={{ transform: `scaleX(${i < active || (i === active && !progressRef) ? 1 : 0})` }}
            />
          </div>
        ))}
      </div>
      <div className="mx-auto mt-3 flex max-w-3xl items-center justify-end gap-2">
        {children}
        <button onClick={onClose} aria-label="Close" className={roundButton}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export function ViewerButton({ className = "", ...props }) {
  return <button {...props} className={`${roundButton} ${className}`} />;
}

// Desktop arrows; on touch screens you swipe
export function ViewerArrows({ count, active, goTo }) {
  const arrow =
    "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 md:flex";
  return (
    <>
      {active > 0 && (
        <button onClick={() => goTo(active - 1)} aria-label="Previous" className={`${arrow} left-6`}>
          <ChevronLeft size={22} />
        </button>
      )}
      <button
        onClick={() => goTo(active + 1)}
        aria-label={active === count - 1 ? "Close" : "Next"}
        className={`${arrow} right-6`}
      >
        <ChevronRight size={22} />
      </button>
    </>
  );
}
