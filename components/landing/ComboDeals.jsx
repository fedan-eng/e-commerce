"use client";
// components/landing/ComboDeals.jsx — "Combo Deals": every bundle in stock as a card with its
// art, price and a "Buy now" button that adds it to the cart. Two across on phones.
// A bundle with `href` is a preview (PREVIEW_BUNDLES in app/page.jsx): its button links there
// instead, since there's no product to add yet.
//
// Motion: the heading and cards rise in one after another as the section scrolls into view; on
// desktop a card tilts towards the mouse, lifts, zooms its art and catches a sweep of light.
// All of it is skipped for "reduce motion".
import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BundleBanner } from "@/components/cart/BundleCard";
import AddToCartButton from "@/components/AddToCart";
import { formatAmount } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1];
const BUTTON = "mt-3 flex h-11 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-white transition-[background-color,box-shadow] duration-300 hover:bg-black hover:shadow-[0_10px_24px_rgba(0,67,40,0.35)] disabled:opacity-60";

const list = { hide: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const rise = { hide: { opacity: 0, y: 40, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } } };
const heading = { hide: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

function ComboCard({ bundle, still }) {
  const href = bundle.href || `/products/${bundle._id}`;
  const original = bundle.originalPrice > bundle.price ? bundle.originalPrice : null;

  // Tilt towards the mouse (desktop only; touch never fires these)
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 18 });
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.45), transparent 55%)`);

  const onMove = (e) => {
    if (still || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.li variants={still ? undefined : rise} className="flex flex-col [perspective:900px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={still ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={still ? undefined : { y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-[16px] shadow-[0_2px_0_rgba(0,0,0,0)] transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(0,67,40,0.22)]"
      >
        <Link href={href} aria-label={bundle.name} className="relative block overflow-hidden rounded-[16px] border-[1.5px] border-[#014628]">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <BundleBanner
              variant="combo"
              image={bundle.image}
              name={bundle.name}
              price={bundle.price}
              originalPrice={original}
              aspect="aspect-square"
              sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
            />
          </div>
          {!still && (
            <>
              {/* Light that follows the mouse */}
              <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
              {/* A sweep of light across the card on hover */}
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-[left] duration-700 ease-out group-hover:left-[150%]" />
            </>
          )}
        </Link>
      </motion.div>

      <Link href={href} className="mt-3 border-b border-line pb-2.5 text-[15px] font-bold text-forest transition-colors hover:text-[#16b04b]">
        {bundle.name}
      </Link>
      <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
        <span className="text-lg font-extrabold text-forest">{formatAmount(bundle.price)}</span>
        {original && <span className="text-xs text-[#b8c2bd] line-through">{formatAmount(original)}</span>}
        {original && (
          <span className="rounded-full bg-[#1fd17a]/15 px-2 py-0.5 text-[11px] font-bold text-[#0b7a43]">
            Save {formatAmount(original - bundle.price)}
          </span>
        )}
      </p>

      {bundle.href ? (
        <Link href={href} className={BUTTON}>Buy now</Link>
      ) : (
        <AddToCartButton product={bundle} label="Buy now" className={BUTTON} />
      )}
    </motion.li>
  );
}

export default function ComboDeals({ bundles }) {
  const still = useReducedMotion();
  if (!bundles?.length) return null;
  const reveal = still ? {} : { initial: "hide", whileInView: "show", viewport: { once: true, amount: 0.2 } };

  return (
    <section className="w-full overflow-hidden bg-sage px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <motion.div className="mx-auto max-w-[1280px]" variants={list} {...reveal}>
        <motion.h2 variants={still ? undefined : heading} className="text-[26px] font-bold tracking-tight text-forest sm:text-3xl md:text-4xl">
          Combo Deals
        </motion.h2>
        <motion.p variants={still ? undefined : heading} className="mt-1 text-[15px] text-muted md:text-base">
          Steal 3 products for the price of 1.
        </motion.p>

        <motion.ul variants={list} className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:mt-8 md:grid-cols-3 lg:grid-cols-4">
          {bundles.map((bundle) => (
            <ComboCard key={bundle._id} bundle={bundle} still={still} />
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
