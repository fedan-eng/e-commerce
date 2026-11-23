"use client";
// components/landing/BundleHeroCarousel.jsx — the landing page's first section: one slide per
// bundle (BundleHero). Moves on by itself every few seconds, swipes on phones, and has the
// pill dots over the bow, as in the design. Pauses while hovered or focused.
import { useCallback, useEffect, useRef, useState } from "react";
import BundleHero from "./BundleHero";

const SLIDE_MS = 5000;
const SWIPE_PX = 40;

export default function BundleHeroCarousel({ bundles }) {
  const count = bundles.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, count, paused, go]);

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
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
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
            <BundleHero bundle={bundle} priority={i === 0} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-[5%] z-20 flex justify-center gap-2 md:bottom-6">
          {bundles.map((bundle, i) => (
            <button
              key={bundle._id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${bundle.name}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
