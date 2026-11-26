"use client";
// components/BlackFridayPopup.jsx — the Black Friday popup while the deals run (27–29 Nov,
// lib/blackFriday.js). Takes the welcome popup's place. Two modes:
//
//  • Slider (normal): designed slides built from the live deals (hooks/useDeals):
//      1. a free-gift slide per gift ("Free cord" for MagFlex and Thunder…)
//      2. "Selling fast"
//      3. one slide for all the % off deals ("35% – 50% off")
//      4. the remaining gift slides
//    The slide holding a product already in the shopper's cart goes first; otherwise this order.
//    Opens by itself once a day, and from anywhere via the "fil:open-deals" event.
//
//  • Sold out: stays silent until a deal sells out. Then, the next time the shopper lands, this
//    replaces the slider: "The MagFlex free-cord deal is gone. Don't miss out on the others!!!"
//    with a swipeable row of the deals still live. Shown once per sold-out deal.
//
// Product art is the products' real photos, each bouncing on its own (components/blackfriday/shared).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import useDeals from "@/hooks/useDeals";
import { isBlackFridayLive } from "@/lib/blackFriday";
import { formatAmount } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCart";
import { BF, DatePill, DealArt, GREEN_TEXT, giftLabel, joinNames, shortName } from "@/components/blackfriday/shared";
import { DealBadge, StockBar } from "@/components/blackfriday/FlashDeals";

export const OPEN_DEALS_EVENT = "fil:open-deals";
const SEEN_KEY = "fil_bf_popup_seen"; // the day the slider was last shown, so it opens once a day
const SOLD_OUT_SEEN_KEY = "fil_bf_soldout_seen"; // ids of sold-out deals the shopper has been told about
const OPEN_DELAY_MS = 3000;
const SLIDE_MS = 5000;
const HIDDEN_PATHS = ["/cart", "/checkout", "/login", "/register", "/reset-password", "/review", "/verify-email"];
const DEALS_HREF = "/#flash-deals";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

function readSoldOutSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SOLD_OUT_SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

const artOf = (p, tag) => ({ key: p._id + (tag ? "-gift" : ""), image: p.image, name: p.name, tag });

// ── Slides ────────────────────────────────────────────────────────────────────────────────

function giftSlide(deals) {
  const gift = giftLabel(deals[0].gift);
  const products = deals.flatMap((d) => d.products);
  const quotas = [...new Set(deals.map((d) => d.quota))];
  const who = quotas.length === 1
    ? `First ${quotas[0]} ${joinNames(products.map((p) => shortName(p.name)))} buyers`
    : joinNames(deals.map((d) => `the first ${d.quota} ${joinNames(d.products.map((p) => shortName(p.name)))} buyers`)).replace(/^t/, "T");
  const giftProduct = deals.find((d) => d.giftProduct?.image)?.giftProduct;
  const art = products.map((p) => artOf(p));
  // The free product goes next to the main one, tagged FREE
  if (giftProduct) art.splice(1, 0, artOf(giftProduct, `Free ${gift.split(" + ")[0]}`));
  return {
    key: `gift-${gift}`,
    kind: "gift",
    ids: new Set(products.map((p) => p._id)),
    art,
    href: products.length === 1 ? `/products/${products[0]._id}` : DEALS_HREF,
    title: (
      <>
        <span className="block text-white">Black Friday</span>
        <span className={`block ${GREEN_TEXT}`}>Flash deals</span>
      </>
    ),
    body: (
      <div className="mx-auto mt-4 w-full rounded-2xl bg-white/[0.06] px-4 py-3 text-center ring-1 ring-white/10">
        <p className="text-sm font-black uppercase" style={{ color: BF.lime }}>Free {gift}</p>
        <p className="mt-1 text-[13px] leading-snug text-white/80">{who} get a free {gift.replace(" + ", " and ")}.</p>
      </div>
    ),
  };
}

function sellingFastSlide(deals) {
  const seen = new Set();
  const art = deals.flatMap((d) => d.products).filter((p) => !seen.has(p._id) && seen.add(p._id)).map((p) => artOf(p));
  return {
    key: "selling-fast",
    kind: "fast",
    ids: new Set(), // never jumps ahead for what's in the cart
    art,
    href: DEALS_HREF,
    title: <span className={`block ${GREEN_TEXT}`}>Selling fast</span>,
    body: (
      <p className="mt-3 text-center text-base leading-snug text-white/90">
        When a deal sells out, it&apos;s gone.
        <br />
        <span className="font-bold" style={{ color: BF.green }}>Grab yours first</span>
      </p>
    ),
  };
}

function discountSlide(deals) {
  const percents = [...new Set(deals.map((d) => d.percent))].sort((a, b) => a - b);
  const products = deals.flatMap((d) => d.products);
  const lines = percents.map((pc) => ({
    pc,
    names: joinNames(deals.filter((d) => d.percent === pc).flatMap((d) => d.products.map((p) => shortName(p.name)))),
  }));
  return {
    key: "discounts",
    kind: "discount",
    ids: new Set(products.map((p) => p._id)),
    art: products.map((p) => artOf(p)),
    href: products.length === 1 ? `/products/${products[0]._id}` : DEALS_HREF,
    title: (
      <span className={`block ${GREEN_TEXT}`}>
        {percents.length > 1 ? `${percents[0]}% – ${percents[percents.length - 1]}%` : `${percents[0]}%`} off
      </span>
    ),
    body: (
      <p className="mt-3 text-center text-[15px] font-medium leading-snug text-white/90">
        {lines.map((l, i) => (
          <span key={l.pc} className="block">
            {l.names} <span className="font-black" style={{ color: BF.lime }}>{l.pc}% off</span>
            {i < lines.length - 1 ? "." : ""}
          </span>
        ))}
      </p>
    ),
  };
}

function buildSlides(deals, cartIds) {
  const giftGroups = new Map();
  for (const d of deals.filter((x) => x.type === "gift")) {
    const k = giftLabel(d.gift).toLowerCase();
    giftGroups.set(k, [...(giftGroups.get(k) || []), d]);
  }
  const gifts = [...giftGroups.values()].map(giftSlide);
  const discounts = deals.filter((d) => d.type === "discount");
  const slides = [
    gifts[0],
    deals.length > 1 && sellingFastSlide(deals),
    discounts.length > 0 && discountSlide(discounts),
    ...gifts.slice(1),
  ].filter(Boolean);

  // The slide with something from the cart goes first
  const first = slides.findIndex((s) => [...s.ids].some((id) => cartIds.has(id)));
  if (first > 0) slides.unshift(slides.splice(first, 1)[0]);
  return slides;
}

// ── Shell ─────────────────────────────────────────────────────────────────────────────────

function Shell({ label, onClose, closeRef, children, onHover }) {
  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[400px] overflow-y-auto overflow-x-hidden rounded-[28px] text-white shadow-2xl ring-1 ring-white/10"
        style={{ background: `radial-gradient(ellipse 90% 45% at 50% 0%, rgba(34,211,107,0.28), transparent 70%), ${BF.bg}` }}
        initial={{ y: 24, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={18} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

const CTA = "flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-base font-bold shadow-[0_8px_24px_rgba(34,211,107,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]";

// ── Slider ────────────────────────────────────────────────────────────────────────────────

function Slider({ slides, onClose }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const closeRef = useRef(null);
  const count = slides.length;

  useEffect(() => closeRef.current?.focus(), []);

  const go = useCallback((step) => {
    setDirection(step);
    setIndex((i) => (i + step + count) % count);
  }, [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [paused, count, index, go]);

  const slide = slides[Math.min(index, count - 1)];

  return (
    <Shell label="Black Friday flash deals" onClose={onClose} closeRef={closeRef} onHover={setPaused}>
      <div className="overflow-hidden px-6 pt-10">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={slide.key}
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
            className="flex cursor-grab flex-col items-center active:cursor-grabbing"
          >
            <DealArt items={slide.art} className="h-[180px] sm:h-[200px]" />
            <DatePill className="mt-3" />
            <h2 className="mt-3 text-center text-[34px] font-black uppercase leading-[0.95] tracking-tight">{slide.title}</h2>
            {slide.body}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-6 pt-4">
        {count > 1 && (
          <div className="mb-4 flex justify-center gap-1.5" role="tablist" aria-label="Deals">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6" : "w-1.5 bg-white/30"}`}
                style={i === index ? { background: BF.green } : undefined}
              />
            ))}
          </div>
        )}
        <Link href={slide.href} onClick={onClose} className={CTA} style={{ background: BF.green, color: BF.ink }}>
          Grab a deal <ArrowRight size={18} />
        </Link>
        <button type="button" onClick={onClose} className="mx-auto mt-3 block text-sm text-white/60 hover:text-white">
          Maybe later
        </button>
      </div>
    </Shell>
  );
}

// ── Sold out ──────────────────────────────────────────────────────────────────────────────

function soldOutLine(deal) {
  const names = joinNames(deal.products.map((p) => shortName(p.name)));
  return deal.type === "gift" ? `The ${names} free-${giftLabel(deal.gift).replace(" + ", "-and-")} deal is gone.` : `The ${names} ${deal.percent}%-off deal is gone.`;
}

function SoldOut({ gone, live, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => closeRef.current?.focus(), []);
  const product = gone.products[0];
  const cards = live.flatMap((deal) => deal.products.map((p) => ({ deal, p })));

  return (
    <Shell label="A flash deal has sold out" onClose={onClose} closeRef={closeRef}>
      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <motion.span
          className="rounded-full bg-[#ff3b3b] px-3 py-1 text-xs font-black uppercase tracking-wide text-white"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.4 }}
        >
          Sold out
        </motion.span>
        <div className="relative mt-3 h-24 w-24">
          {product?.image && <Image src={product.image} alt={product.name} fill sizes="96px" className="object-contain opacity-80 grayscale-[40%]" />}
          <motion.span
            className="absolute -right-1 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff3b3b] text-white shadow-lg"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 14 }}
          >
            <X size={16} strokeWidth={3} />
          </motion.span>
        </div>
        <p className="mt-3 text-sm text-white/80">{soldOutLine(gone)}</p>
        <h2 className={`mt-1 text-[30px] font-black uppercase leading-[0.95] tracking-tight ${GREEN_TEXT}`}>Don&apos;t miss out on the others!!!</h2>
      </div>

      {cards.length > 0 && (
        <>
          <ul className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cards.map(({ deal, p }) => (
              <li key={`${deal.id}-${p._id}`} className="w-[150px] shrink-0 snap-start rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/10">
                <Link href={`/products/${p._id}`} onClick={onClose} className="relative block aspect-square overflow-hidden rounded-xl bg-[#ecfbf1]">
                  {p.image && <Image src={p.image} alt={p.name} fill sizes="150px" className="object-contain p-2" />}
                  <span className="absolute right-1.5 top-1.5">
                    {deal.type === "gift" ? (
                      <span className="rounded-full bg-[#ff3b3b] px-1.5 py-0.5 text-[9px] font-black uppercase text-white">Free gift</span>
                    ) : (
                      <DealBadge deal={deal} className="origin-top-right scale-[0.72]" />
                    )}
                  </span>
                </Link>
                <p className="mt-2 line-clamp-1 text-left text-[13px] font-bold">{shortName(p.name)}</p>
                <p className="text-left text-sm font-extrabold">{formatAmount(p.dealPrice)}</p>
                <StockBar deal={deal} />
                <AddToCartButton
                  product={{ _id: p._id, name: p.name, price: p.price, category: p.category, image: p.image, colors: p.colors }}
                  label="Buy now"
                  className="mt-2 flex h-9 w-full items-center justify-center rounded-full bg-[#22d36b] text-[13px] font-bold text-[#04140b]"
                />
              </li>
            ))}
          </ul>
          <p className="mt-1 text-center text-xs text-white/50">
            Swipe to see all {live.length} live {live.length === 1 ? "deal" : "deals"}
          </p>
        </>
      )}

      <div className="px-6 pb-6 pt-4">
        <Link href={DEALS_HREF} onClick={onClose} className={CTA} style={{ background: BF.green, color: BF.ink }}>
          See all flash deals <ArrowRight size={18} />
        </Link>
      </div>
    </Shell>
  );
}

// ── Popup ─────────────────────────────────────────────────────────────────────────────────

export default function BlackFridayPopup() {
  const pathname = usePathname();
  const cartItems = useSelector((s) => s.cart.items);
  const { all, deals, loaded } = useDeals();
  const [mode, setMode] = useState(null); // null (not shown yet) | "slider" | "soldout" | false (closed)
  const [soldOutSeen, setSoldOutSeen] = useState(null); // Set, read after mount

  useEffect(() => setSoldOutSeen(readSoldOutSeen()), []);

  const hidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  const cartKey = cartItems.map((i) => i._id).sort().join(",");
  // Worked out when the popup opens, so slides don't reorder while it's on screen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const slides = useMemo(() => buildSlides(deals, new Set(cartKey.split(","))), [deals, mode === null]);

  // The newest sold-out deal this shopper hasn't been told about
  const newlyGone = useMemo(
    () => (soldOutSeen ? all.filter((d) => d.soldOut && !soldOutSeen.has(d.id)) : []),
    [all, soldOutSeen]
  );

  // A few seconds after landing: the sold-out news if there is any, else the slider once a day
  useEffect(() => {
    if (hidden || !loaded || !soldOutSeen || mode !== null || !isBlackFridayLive()) return;
    let next = null;
    if (newlyGone.length > 0) next = "soldout";
    else if (slides.length > 0) {
      let seenToday = false;
      try {
        seenToday = localStorage.getItem(SEEN_KEY) === today();
      } catch {}
      if (!seenToday) next = "slider";
    }
    if (!next) return;
    const t = setTimeout(() => setMode(next), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [hidden, loaded, soldOutSeen, newlyGone.length, slides.length, mode]);

  // Anything on the site can open the slider
  useEffect(() => {
    const onOpen = () => setMode("slider");
    window.addEventListener(OPEN_DEALS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_DEALS_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, today());
      if (mode === "soldout") {
        const ids = [...readSoldOutSeen(), ...all.filter((d) => d.soldOut).map((d) => d.id)];
        localStorage.setItem(SOLD_OUT_SEEN_KEY, JSON.stringify([...new Set(ids)]));
        setSoldOutSeen(new Set(ids));
      }
    } catch {}
    setMode(false); // closed for this page view
  }, [mode, all]);

  useEffect(() => {
    if (!mode) return;
    const onKey = (e) => e.key === "Escape" && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mode, close]);

  return (
    <AnimatePresence>
      {mode === "soldout" && newlyGone[0] && <SoldOut key="soldout" gone={newlyGone[0]} live={deals} onClose={close} />}
      {mode === "slider" && slides.length > 0 && <Slider key="slider" slides={slides} onClose={close} />}
    </AnimatePresence>
  );
}
