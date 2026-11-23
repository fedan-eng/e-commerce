"use client";
// components/BlackFridayPopup.jsx — Black Friday flash deals popup (27–29 Nov, lib/blackFriday.js).
// Takes the welcome popup's place while the deals run. Slides through the deals still available
// (hooks/useDeals), starting with the ones for products already in the shopper's cart. Opens by
// itself once a day, and from the header bar ("fil:open-deals" event).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gift, X, Zap } from "lucide-react";
import useDeals from "@/hooks/useDeals";
import { BLACK_FRIDAY_END, isBlackFridayLive } from "@/lib/blackFriday";
import { formatAmount } from "@/lib/utils";

export const OPEN_DEALS_EVENT = "fil:open-deals";
const SEEN_KEY = "fil_bf_popup_seen"; // the day it was last shown, so it opens once a day
const OPEN_DELAY_MS = 3000;
const SLIDE_MS = 4500;
const HIDDEN_PATHS = ["/cart", "/checkout", "/login", "/register", "/reset-password", "/review", "/verify-email"];

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

// One slide per deal (its first in-stock product), plus the bundle; cart matches go first
function buildSlides(deals, bundle, cartIds) {
  const slides = deals.map((deal) => {
    const inCart = deal.products.find((p) => cartIds.has(p._id));
    const p = inCart || deal.products[0];
    return {
      key: deal.id,
      kind: deal.type,
      inCart: Boolean(inCart),
      title: deal.title,
      name: deal.products.length > 1 ? deal.products.map((x) => x.name).join(" / ") : p.name,
      badge: deal.type === "gift" ? `Free ${deal.gift.replace(/^free\s+/i, "")}` : `−${deal.percent}%`,
      image: p.image,
      price: p.dealPrice,
      oldPrice: deal.type === "discount" ? p.price : null,
      left: deal.left,
      href: `/products/${p._id}`,
    };
  });
  const bundleSlide = bundle && {
    key: `bundle-${bundle._id}`,
    kind: "bundle",
    inCart: cartIds.has(bundle._id),
    title: bundle.count > 1 ? `${bundle.count} items for the price of one` : "Bundle deal",
    name: bundle.name,
    badge: "Bundle",
    image: bundle.image,
    price: bundle.price,
    oldPrice: bundle.originalPrice,
    left: null,
    href: `/products/${bundle._id}`,
  };
  const all = bundleSlide ? [...slides, bundleSlide] : slides;
  // Cart matches first, then the rest in the admin's order (stable sort)
  return all.sort((a, b) => Number(b.inCart) - Number(a.inCart));
}

function useCountdown(end) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, end - now);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    days: Math.floor(ms / 86400000),
    clock: `${pad(Math.floor(ms / 3600000) % 24)}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}`,
  };
}

function Countdown() {
  const { days, clock } = useCountdown(BLACK_FRIDAY_END.getTime());
  return (
    <p className="text-xs font-medium text-white/70">
      Ends in{" "}
      <span className="font-mono font-semibold tabular-nums text-[#ffd95d]">
        {days > 0 && `${days}d `}
        {clock}
      </span>
    </p>
  );
}

// The product pops in, then gives a little shake every couple of seconds
function ProductArt({ slide }) {
  return (
    <motion.div
      key={slide.key}
      initial={{ scale: 0.3, rotate: -12, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
      className="relative h-full w-full"
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotate: [0, -7, 7, -5, 5, -2, 0], scale: [1, 1.04, 1.04, 1.02, 1.02, 1, 1] }}
        transition={{ duration: 0.7, delay: 0.9, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
      >
        {slide.image && (
          <Image
            src={slide.image}
            alt={slide.name}
            fill
            sizes="260px"
            className={slide.kind === "bundle" ? "rounded-3xl object-cover object-[50%_72%]" : "object-contain drop-shadow-[0_18px_30px_rgba(255,217,93,0.25)]"}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export default function BlackFridayPopup() {
  const pathname = usePathname();
  const cartItems = useSelector((s) => s.cart.items);
  const { deals, bundle, loaded } = useDeals();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const closeRef = useRef(null);

  const hidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  const cartKey = cartItems.map((i) => i._id).sort().join(",");
  // Worked out when the popup opens, so the order doesn't jump while it's on screen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const slides = useMemo(() => buildSlides(deals, bundle, new Set(cartKey.split(","))), [deals, bundle, open]);

  // Once a day, a few seconds after landing, while the deals are live and some are left
  useEffect(() => {
    if (hidden || !loaded || slides.length === 0 || !isBlackFridayLive()) return;
    let seenToday = false;
    try {
      seenToday = localStorage.getItem(SEEN_KEY) === today();
    } catch {}
    if (seenToday) return;
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [hidden, loaded, slides.length]);

  // The header bar opens it on demand
  useEffect(() => {
    const onOpen = () => {
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_DEALS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_DEALS_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, today());
    } catch {}
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const count = slides.length;
  const go = useCallback((step) => {
    setDirection(step);
    setIndex((i) => (i + step + count) % count);
  }, [count]);

  // Auto-advance, paused while the pointer is over the card
  useEffect(() => {
    if (!open || paused || count < 2) return;
    const t = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [open, paused, count, index, go]);

  const slide = slides[Math.min(index, count - 1)];

  return (
    <AnimatePresence>
      {open && slide && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Black Friday flash deals"
            className="relative w-full max-w-[420px] overflow-hidden rounded-t-[28px] bg-[#0b0b0b] text-white shadow-2xl ring-1 ring-white/10 sm:rounded-[28px]"
            initial={{ y: 80, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 60, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Glow behind the product */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-64 w-64 rounded-full bg-[#ffd95d]/20 blur-3xl" />

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="relative z-10 px-6 pt-6">
              <motion.p
                className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffd95d]"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Flash deals · Grab it now
              </motion.p>
              <motion.h2
                className="mt-1 text-[34px] font-black uppercase leading-none tracking-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
              >
                Black Friday
              </motion.h2>
              <div className="mt-1.5">
                <Countdown />
              </div>
            </div>

            {/* Slide */}
            <div className="relative z-10 mt-2 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={slide.key}
                  custom={direction}
                  initial={{ x: direction * 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -60, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50) go(1);
                    else if (info.offset.x > 50) go(-1);
                  }}
                  className="cursor-grab px-6 active:cursor-grabbing"
                >
                  <div className="relative mx-auto h-[200px] w-full max-w-[260px] sm:h-[220px]">
                    <ProductArt slide={slide} />
                    <motion.span
                      className="absolute -right-1 top-2 z-10 flex h-16 w-16 rotate-12 flex-col items-center justify-center rounded-full bg-[#ffd95d] text-center text-black shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.25, 1] }}
                      transition={{ delay: 0.45, duration: 0.45 }}
                    >
                      {slide.kind === "gift" ? <Gift size={16} /> : slide.kind === "bundle" ? <Zap size={16} /> : null}
                      <span className={`font-black leading-none ${slide.kind === "discount" ? "text-lg" : "mt-0.5 px-1 text-[10px]"}`}>{slide.badge}</span>
                    </motion.span>
                  </div>

                  {slide.inCart && (
                    <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#4ade80]">In your cart</p>
                  )}
                  <h3 className="mt-2 text-center text-xl font-bold leading-tight">{slide.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-center text-sm text-white/60">{slide.name}</p>

                  <div className="mt-3 flex items-baseline justify-center gap-2">
                    <span className="text-2xl font-extrabold">{formatAmount(slide.price)}</span>
                    {slide.oldPrice > slide.price && <span className="text-sm text-white/50 line-through">{formatAmount(slide.oldPrice)}</span>}
                  </div>
                  {slide.left != null && (
                    <p className="mt-1 text-center text-xs font-semibold text-[#ff6b6b]">
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>●</motion.span>{" "}
                      Only {slide.left} left
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {count > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous deal"
                    className="absolute left-2 top-[100px] flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next deal"
                    className="absolute right-2 top-[100px] flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* CTA and dots */}
            <div className="relative z-10 px-6 pb-6 pt-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={slide.href}
                  onClick={close}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#ffd95d] text-base font-bold text-black shadow-[0_8px_24px_rgba(255,217,93,0.35)]"
                >
                  <Zap size={18} fill="currentColor" /> Grab it now
                </Link>
              </motion.div>
              <p className="mt-2.5 text-center text-[11px] text-white/50">While stocks last · Free delivery is paused until Sunday</p>

              {count > 1 && (
                <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Deals">
                  {slides.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Deal ${i + 1}: ${s.title}`}
                      onClick={() => {
                        setDirection(i > index ? 1 : -1);
                        setIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#ffd95d]" : "w-1.5 bg-white/30"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
