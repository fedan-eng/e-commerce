"use client";
// components/landing/BundleHeroCarousel.jsx — the landing page's first section: one slide per
// bundle (BundleHero). Moves on by itself every few seconds, swipes on phones, and has the
// pill dots over the bow, as in the design. Pauses while hovered or focused.
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import BundleHero from "./BundleHero";

const SLIDE_MS = 5000;
const SWIPE_PX = 40;

export default function BundleHeroCarousel({ bundles }) {
  const count = bundles.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const still = useReducedMotion();

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || still) return;
    const t = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, count, paused, still, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Bundle deals"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${index * 100}%)` }}>
        {bundles.map((bundle, i) => (
          <div
            key={bundle._id}
            className="w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${bundle.name}`}
            aria-hidden={i !== index}
            inert={i !== index ? true : undefined}
          >
            <BundleHero bundle={bundle} priority={i === 0} active={i === index} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-[5%] z-20 flex justify-center gap-2 md:bottom-6">
          {/* The active dot fills up until the next slide */}
          {bundles.map((bundle, i) => (
            <button
              key={bundle._id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${bundle.name}`}
              aria-current={i === index}
              className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-500 ${i === index ? "w-10 bg-white/35" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
            >
              {i === index && (
                <motion.span
                  key={`${index}-${paused}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  initial={{ width: paused || still ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: paused || still ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
