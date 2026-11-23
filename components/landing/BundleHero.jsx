"use client";
// components/landing/BundleHero.jsx — one slide of the landing page hero for a bundle deal.
// bundle: a bundle product (getLiveBundles, lib/products.js). Its art is plain (podium and
// products); the badge, name, prices and button are drawn here so they're real, clickable text.
// On phones the art fills the slide; on wider screens it sits on the right over a background
// made from the art's own plain top strip.
//
// Motion (replayed each time the slide becomes `active`): the copy comes in piece by piece, the
// price counts down from the old price, the art zooms in then floats, and on desktop the art
// tilts with the mouse. All of it is skipped for "reduce motion".
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { formatAmount } from "@/lib/utils";
import { bundlePieceCount } from "@/lib/bundles";

const EASE = [0.22, 1, 0.36, 1];

// Colour of the name's last word ("Trio"): lavender, or light blue on the blue Thunder art
const accentFor = (name) => (/thunder/i.test(name) ? "#7ee0ff" : "#c4b5fd");

const copy = {
  hide: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const rise = {
  hide: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const pop = {
  hide: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 18 } },
};
// Each word of the title slides up from behind a mask
const word = {
  hide: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
};

// "Snap Trio" → "Snap" in white and "Trio" in the accent colour, word by word
function Title({ name }) {
  const words = name.trim().split(/\s+/);
  return words.map((w, i) => (
    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
      <motion.span
        variants={word}
        className="inline-block"
        style={i === words.length - 1 && words.length > 1 ? { color: accentFor(name) } : undefined}
      >
        {w}
        {i < words.length - 1 && " "}
      </motion.span>
    </span>
  ));
}

// Counts down from the old price to the deal price when the slide comes in
function CountingPrice({ from, to, active, still }) {
  const value = useMotionValue(still || !from ? to : from);
  const text = useTransform(value, (v) => formatAmount(Math.round(v / 50) * 50));
  useEffect(() => {
    if (still || !from) return value.set(to);
    if (!active) return value.set(from);
    const controls = animate(value, to, { duration: 1.1, delay: 0.55, ease: EASE });
    return () => controls.stop();
  }, [active, from, to, still, value]);
  return <motion.span>{text}</motion.span>;
}

// priority: the first slide's images load straight away (and its title is the page's h1).
// active: this slide is the one showing. bundle.href: where "Shop now" goes when it isn't a
// real product yet (PREVIEW_BUNDLES in app/page.jsx).
export default function BundleHero({ bundle, priority = false, active = true }) {
  const still = useReducedMotion();
  const href = bundle.href || `/products/${bundle._id}`;
  const count = bundlePieceCount(bundle);
  const pieces = count > 1 ? count : null;
  const original = bundle.originalPrice > bundle.price ? bundle.originalPrice : null;
  const Heading = priority ? motion.h1 : motion.h2;
  const art = bundle.heroImage || bundle.image; // the slide art, else the card art
  const state = active || still ? "show" : "hide";

  // Desktop: the art leans towards the mouse
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 14 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 14 });
  const shiftX = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });
  const onMove = (e) => {
    if (still || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // Zoom in when the slide arrives, then (desktop) a slow float
  const artIn = still ? {} : { initial: false, animate: active ? { scale: 1, opacity: 1 } : { scale: 1.08, opacity: 0.6 }, transition: { duration: 1.2, ease: EASE } };
  const float = still ? {} : { animate: { y: [0, -8, 0] }, transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="relative isolate h-full w-full overflow-hidden bg-[#0b3d4a]">
      {/* Phone: the art is the whole slide */}
      <motion.div className="relative aspect-[1127/1396] w-full md:hidden" {...artIn}>
        {art && <Image src={art} alt="" fill priority={priority} sizes="100vw" className="select-none object-cover object-bottom" />}
      </motion.div>

      {/* Tablet and up: the background is the art's plain top strip (above the products),
          blown up and blurred, so it's the art's own colour with no product smudges */}
      {art && (
        <div aria-hidden className="absolute inset-0 hidden overflow-hidden md:block">
          <Image src={art} alt="" fill sizes="40vw" quality={40} className="origin-top scale-[4] object-cover object-top blur-2xl" />
          {/* A soft light that drifts across */}
          {!still && (
            <motion.div
              className="absolute -top-1/3 h-[140%] w-1/2 rounded-full bg-white/10 blur-3xl"
              animate={{ x: ["-30%", "160%"] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      )}

      <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-[1280px] md:relative md:grid md:min-h-[560px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8 md:px-10 lg:min-h-[640px] lg:px-16">
        {/* Copy */}
        <motion.div className="w-full px-5 pt-6 sm:px-8 sm:pt-10 md:px-0 md:py-16" variants={copy} initial="hide" animate={state}>
          <motion.span
            variants={pop}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-[#e5252c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md md:text-sm"
          >
            {!still && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[#e5252c]"
                animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <span className="relative">Bundle deal{pieces && ` · ${pieces} items`}</span>
          </motion.span>

          <Heading variants={copy} className="mt-3 text-[34px] font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:mt-5 lg:text-6xl">
            <Title name={bundle.name} />
          </Heading>
          <motion.p variants={rise} className="mt-1 text-[15px] font-medium text-white/90 sm:text-lg md:mt-3 lg:text-xl">
            {pieces ? `Get ${pieces} items for the price of one!` : "One price for the whole set."}
          </motion.p>

          <motion.div variants={rise} className="mt-4 flex items-center gap-5 md:mt-8">
            <p className="leading-none text-white">
              <span className="block text-[26px] font-extrabold tabular-nums sm:text-3xl lg:text-4xl">
                <CountingPrice from={original} to={bundle.price} active={active} still={still} />
              </span>
              {original && <span className="mt-1 block text-sm text-white/70 line-through lg:text-base">{formatAmount(original)}</span>}
            </p>
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={href}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#3ee07a] to-[#16b04b] px-6 py-3 text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(22,176,75,0.45)] transition-shadow hover:shadow-[0_10px_28px_rgba(22,176,75,0.6)] lg:px-8 lg:py-3.5 lg:text-base"
              >
                {/* A light that sweeps across every few seconds */}
                {!still && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/40 blur-[2px]"
                    animate={{ x: ["0%", "500%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
                  />
                )}
                <span className="relative">Shop now</span>
                <ArrowRight size={17} className="relative transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Tablet and up: the art beside the copy, edges faded into the background */}
        <motion.div
          className="relative hidden aspect-[1127/1396] w-full max-w-[520px] self-end justify-self-end [perspective:1200px] md:block"
          {...artIn}
        >
          <motion.div className="absolute inset-0" style={still ? undefined : { rotateX, rotateY, x: shiftX }}>
            <motion.div className="absolute inset-0" {...float}>
              <Link href={href} aria-label={`Shop the ${bundle.name}`} className="absolute inset-0">
                {art && (
                  <Image
                    src={art}
                    alt={`${bundle.name} bundle`}
                    fill
                    priority={priority}
                    sizes="(min-width: 1280px) 520px, 45vw"
                    className="select-none object-cover object-bottom [mask-image:linear-gradient(to_right,transparent,black_22%,black_78%,transparent),linear-gradient(to_bottom,transparent,black_25%,black_94%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]"
                  />
                )}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
