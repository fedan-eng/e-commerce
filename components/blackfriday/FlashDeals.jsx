"use client";
// components/blackfriday/FlashDeals.jsx — the homepage's "⚡ FLASH DEALS" grid while Black Friday is
// on: a card per deal product with its badge, "First N buyers get…", a stock bar, the deal price
// and Buy now (two across on phones). Products in one deal share its stock bar.
// Before Fri 27 Nov it's a preview: the button says when the deal starts instead of selling at full price.
// Sold-out deals stay in the grid, greyed out. The popups link here (#flash-deals).
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Gift, Zap } from "lucide-react";
import AddToCartButton from "@/components/AddToCart";
import useDeals from "@/hooks/useDeals";
import { formatAmount } from "@/lib/utils";
import { productInStock } from "@/lib/stock";
import { BF, DatePill, GREEN_TEXT, dealBlurb, giftLabel, useBlackFridayClock } from "./shared";

const BUY = "mt-3 flex h-10 w-full items-center justify-center rounded-full text-sm font-bold transition-transform active:scale-95";

// A deal's stock: how much of the bar is left, and the words under it
export function StockBar({ deal, dark = true }) {
  const left = Math.max(0, deal.left ?? 0);
  const pct = deal.quota ? Math.max(deal.soldOut ? 0 : 6, Math.round((left / deal.quota) * 100)) : 0;
  const low = !deal.soldOut && left <= Math.max(3, deal.quota * 0.2);
  return (
    <div className="mt-2">
      <div className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-black/10"}`}>
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: low ? "#ff6b4a" : BF.green }} />
      </div>
      <p className={`mt-1 text-[11px] font-semibold ${low ? "text-[#ff8a6b]" : dark ? "text-white/60" : "text-black/55"}`}>
        {deal.soldOut ? "All gone" : `${left} left`}
      </p>
    </div>
  );
}

// "35% OFF" circle or "FREE CORD" tag
export function DealBadge({ deal, className = "" }) {
  if (deal.type === "gift") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-black ${className}`} style={{ background: BF.lime }}>
        <Gift size={11} aria-hidden /> Free {giftLabel(deal.gift)}
      </span>
    );
  }
  return (
    <span className={`flex h-12 w-12 rotate-12 flex-col items-center justify-center rounded-full bg-[#ff3b3b] text-center font-black leading-none text-white shadow-lg ${className}`}>
      <span className="text-sm">{deal.percent}%</span>
      <span className="text-[9px]">OFF</span>
    </span>
  );
}

function DealCard({ deal, product, phase }) {
  const soldOut = deal.soldOut || !productInStock({ colors: product.colors });
  const href = `/products/${product._id}`;
  const price = product.dealPrice;
  const old = product.originalPrice > price ? product.originalPrice : null;

  return (
    <li className={`flex flex-col rounded-[18px] bg-[#0d1712] p-2.5 ring-1 ring-white/10 ${soldOut ? "opacity-60 grayscale" : ""}`}>
      <Link href={href} className="relative block aspect-square overflow-hidden rounded-[14px] bg-[radial-gradient(circle_at_50%_60%,#1f4d33,#0b1f14)]">
        {product.image && (
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 260px, 45vw" className="object-contain p-4 transition-transform duration-500 hover:scale-105" />
        )}
        <span className="absolute left-2 top-2">{deal.type === "gift" && <DealBadge deal={deal} />}</span>
        {deal.type === "discount" && <DealBadge deal={deal} className="absolute right-2 top-2" />}
        {soldOut && (
          <span className="absolute inset-x-0 bottom-3 mx-auto w-max rounded-full bg-[#ff3b3b] px-3 py-1 text-xs font-black uppercase text-white">Sold out</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-2.5">
        <Link href={href} className="line-clamp-2 text-[13px] font-bold leading-snug text-white hover:underline sm:text-sm">
          {product.name}
        </Link>
        <p className="mt-1 text-[11px] font-semibold leading-snug sm:text-xs" style={{ color: deal.type === "gift" ? BF.lime : BF.green }}>
          {dealBlurb(deal)}
        </p>
        <StockBar deal={deal} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1.5">
          <span className="text-base font-extrabold text-white sm:text-lg">{formatAmount(price)}</span>
          {old && <span className="text-xs text-white/45 line-through">{formatAmount(old)}</span>}
        </div>

        {soldOut ? (
          <button type="button" disabled className={`${BUY} cursor-not-allowed bg-white/10 text-white/60`}>Sold out</button>
        ) : phase === "live" ? (
          <AddToCartButton
            product={{ _id: product._id, name: product.name, price: product.price, category: product.category, image: product.image, colors: product.colors }}
            label="Buy now"
            className={`${BUY} bg-[#22d36b] text-[#04140b] hover:bg-[#3be080]`}
          />
        ) : (
          <Link href={href} className={`${BUY} bg-white/10 text-white hover:bg-white/15`}>Starts Fri 27 Nov</Link>
        )}
      </div>
    </li>
  );
}

export default function FlashDeals({ initialDeals = [] }) {
  const still = useReducedMotion();
  const { all, phase: dealPhase, loaded } = useDeals(initialDeals);
  // The cached page's copy can be from before the deals went live, so Buy now waits for fresh data
  const phase = loaded ? dealPhase : "upcoming";
  const { phase: clockPhase, ready } = useBlackFridayClock();
  if ((ready && clockPhase === "over") || all.length === 0) return null;

  // Live deals first, sold-out ones at the end
  const cards = [...all.filter((d) => !d.soldOut), ...all.filter((d) => d.soldOut)].flatMap((deal) =>
    deal.products.map((product) => ({ deal, product }))
  );

  return (
    <section id="flash-deals" className="scroll-mt-20 bg-[#050b07] px-4 py-12 text-white sm:px-6 md:py-20">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          className="text-center"
          initial={still ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <DatePill prefix="Black Friday · " />
          <h2 className="mt-3 flex items-center justify-center gap-1 text-[44px] font-black uppercase leading-none tracking-tight sm:text-6xl">
            <Zap className="h-9 w-9 sm:h-12 sm:w-12" style={{ color: BF.lime }} fill="currentColor" aria-hidden />
            <span className={GREEN_TEXT}>Flash deals</span>
          </h2>
          <p className="mt-2 text-sm text-white/70 sm:text-base">First come, first served. When a deal sells out, it&apos;s gone.</p>
        </motion.div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {cards.map(({ deal, product }) => (
            <DealCard key={`${deal.id}-${product._id}`} deal={deal} product={product} phase={phase} />
          ))}
        </ul>
      </div>
    </section>
  );
}
