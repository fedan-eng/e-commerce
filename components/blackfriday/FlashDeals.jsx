"use client";
// components/blackfriday/FlashDeals.jsx — the homepage's "⚡ FLASH DEALS" grid while Black Friday is
// on: a card per deal product with its badge, "First N buyers get…", a stock bar, the deal price
// and Buy now (two across on phones). Products in one deal share its stock bar.
// Before Fri 27 Nov it's a preview: the button says when the deal starts instead of selling at full price.
// Sold-out deals stay in the grid, greyed out. The popups link here (#flash-deals).
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import AddToCartButton from "@/components/AddToCart";
import useDeals from "@/hooks/useDeals";
import { formatAmount } from "@/lib/utils";
import { productInStock } from "@/lib/stock";
import { BF, DatePill, GREEN_TEXT, dealBlurb, giftLabel, useBlackFridayClock } from "./shared";

const BUY = "mt-3 flex h-11 w-full items-center justify-center rounded-full text-[15px] font-bold transition-transform active:scale-95";

// Bar colour by how much is left: green when plenty, through lime and yellow, to orange near the end
function stockColor(fraction) {
  if (fraction > 0.6) return "linear-gradient(90deg,#22d36b,#a3e635)";
  if (fraction > 0.35) return "linear-gradient(90deg,#a3e635,#facc15)";
  if (fraction > 0.27) return "linear-gradient(90deg,#facc15,#f97316)";
  return "linear-gradient(90deg,#ff4545,#ff6b6b)"; // nearly gone
}

// Few enough left to shout about: "Only 5 left!"
const isLow = (left, quota) => left > 0 && (left <= 5 || left / quota <= 0.27);

// A deal's stock: the bar and "22 of 30 left" (or "Sold out")
export function StockBar({ deal, dark = true }) {
  const left = deal.soldOut ? 0 : Math.max(0, deal.left ?? 0);
  const fraction = deal.quota ? left / deal.quota : 0;
  return (
    <div className="mt-2.5">
      <div className={`h-2 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-black/10"}`}>
        {left > 0 && (
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(4, fraction * 100)}%`, background: stockColor(fraction) }} />
        )}
      </div>
      <p className={`mt-1.5 text-xs ${dark ? "text-white/60" : "text-black/55"}`}>
        {isLow(left, deal.quota) ? (
          <>
            Only <span className={`font-bold ${dark ? "text-white" : "text-black"}`}>{left}</span> left!
          </>
        ) : left > 0 ? (
          <>
            <span className={`font-bold ${dark ? "text-white" : "text-black"}`}>{left}</span> of {deal.quota} left
          </>
        ) : (
          "Sold out"
        )}
      </p>
    </div>
  );
}

// Round badge in the image's corner: red "35% OFF" / "−50%", or black "FREE CORD" ringed in lime
export function DealBadge({ deal, className = "" }) {
  if (deal.type === "gift") {
    // "FREE CORD" for one short gift; "FREE GIFT" for several ("charger + cord") or a long name
    const label = giftLabel(deal.gift);
    const several = (deal.giftProducts?.length || 0) > 1 || label.includes("+");
    const word = several || label.length > 7 ? "Gift" : label;
    return (
      <span
        className={`flex h-14 w-14 rotate-12 flex-col items-center justify-center rounded-full border-2 bg-black text-center text-[10px] font-black uppercase leading-[1.05] shadow-lg ${className}`}
        style={{ borderColor: BF.lime, color: BF.lime }}
      >
        <span>Free</span>
        <span>{word}</span>
      </span>
    );
  }
  return (
    <span className={`flex h-14 w-14 rotate-12 flex-col items-center justify-center rounded-full bg-[#ff4545] text-center font-black leading-none text-white shadow-lg ${className}`}>
      {deal.percent >= 50 ? (
        <span className="text-base">−{deal.percent}%</span>
      ) : (
        <>
          <span className="text-base">{deal.percent}%</span>
          <span className="text-[10px]">OFF</span>
        </>
      )}
    </span>
  );
}

// The free gifts' photos side by side in one white tile in the image's bottom corner, with a
// red FREE tag (a charger and a cord, say)
function GiftThumb({ gifts = [] }) {
  const shown = gifts.filter((g) => g.image).slice(0, 3);
  if (!shown.length) return null;
  return (
    <span className="absolute bottom-2 right-2 flex flex-col items-center">
      <span className="relative z-10 -mb-1.5 rounded-full bg-[#ff4545] px-2.5 py-px text-[9px] font-black uppercase text-white shadow">Free</span>
      <span className="flex items-center gap-0.5 rounded-xl bg-white p-1 shadow-md">
        {shown.map((g, i) => (
          <span key={g._id || i} className={`relative ${shown.length > 1 ? "h-10 w-9 sm:h-12 sm:w-11" : "h-10 w-10 sm:h-12 sm:w-12"}`}>
            <Image src={g.image} alt={g.name || "Free gift"} fill sizes="48px" className="object-contain" />
          </span>
        ))}
      </span>
    </span>
  );
}

function DealCard({ deal, product, phase, inCart }) {
  const soldOut = deal.soldOut || !productInStock({ colors: product.colors });
  const href = `/products/${product._id}`;
  const price = product.dealPrice;
  // Only a Black Friday % off shows a crossed-out price; gift deals show just what you pay
  const old = deal.type === "discount" && product.originalPrice > price ? product.originalPrice : null;

  return (
    <li className="flex flex-col">
      {/* Mint panel inside a green gradient border */}
      <Link href={href} className="block rounded-[20px] bg-[linear-gradient(135deg,#22d36b,#a3e635_55%,#22d36b)] p-[3px] shadow-[0_8px_28px_rgba(34,211,107,0.18)]">
        <span className="relative block aspect-square overflow-hidden rounded-[17px] bg-[radial-gradient(circle_at_50%_45%,#f2fdf6_0%,#d4f7e1_55%,#b5ecc9_100%)]">
          {product.image && (
            <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 260px, 45vw" className="object-contain p-5 transition-transform duration-500 hover:scale-105" />
          )}
          <DealBadge deal={deal} className="absolute right-2 top-2" />
          {inCart && !soldOut && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#22d36b] px-2.5 py-1 text-[11px] font-bold text-[#04140b] shadow-md">
              <ShoppingCart size={12} strokeWidth={2.5} aria-hidden /> In your Cart
            </span>
          )}
          {deal.type === "gift" && <GiftThumb gifts={deal.giftProducts} />}
          {soldOut && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="-rotate-12 rounded-xl bg-[#ff4545] px-5 py-2 text-center text-2xl font-black uppercase leading-[0.95] text-white shadow-[0_10px_30px_rgba(255,69,69,0.45)] sm:text-3xl">
                Sold
                <br />
                out
              </span>
            </span>
          )}
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link href={href} className="line-clamp-2 text-[15px] font-bold leading-snug text-white hover:underline sm:text-base">
          {product.name}
        </Link>
        <p className="mt-1 text-[13px] font-semibold leading-snug" style={{ color: "#c6f135" }}>
          {dealBlurb(deal)}
        </p>
        <StockBar deal={{ ...deal, soldOut }} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-lg font-extrabold text-white sm:text-xl">{formatAmount(price)}</span>
          {old && !soldOut && <span className="text-xs text-white/45 line-through">{formatAmount(old)}</span>}
        </div>

        {soldOut ? (
          <button type="button" disabled className={`${BUY} cursor-not-allowed bg-white/15 text-white/50`}>Sold out</button>
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
  const cartItems = useSelector((st) => st.cart.items);
  // The cart lives in the browser, so the tag only shows after mounting (no hydration mismatch)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inCart = new Set(mounted ? cartItems.map((i) => String(i._id)) : []);
  // The cached page's copy can be from before the deals went live, so Buy now waits for fresh data
  const phase = loaded ? dealPhase : "upcoming";
  const { phase: clockPhase, ready } = useBlackFridayClock();
  if ((ready && clockPhase === "over") || all.length === 0) return null;

  // Live deals first, sold-out ones at the end
  const cards = [...all.filter((d) => !d.soldOut), ...all.filter((d) => d.soldOut)].flatMap((deal) =>
    deal.products.map((product) => ({ deal, product }))
  );

  return (
    <section id="flash-deals" className="relative isolate scroll-mt-20 overflow-hidden bg-[#050b07] px-4 pb-16 pt-14 text-white sm:px-6 sm:pt-16 md:pb-20 md:pt-16">
      {/* Carries on the hero's green glow, so the two read as one */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_top,rgba(34,211,107,0.16),transparent_65%)]" />
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          className="text-center"
          initial={still ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <DatePill prefix="Black Friday · " />
          <h2 className="mt-5 flex items-center justify-center gap-1 text-[44px] font-black uppercase leading-none tracking-tight sm:text-6xl">
            <Zap className="h-9 w-9 sm:h-12 sm:w-12" style={{ color: BF.lime }} fill="currentColor" aria-hidden />
            <span className={GREEN_TEXT}>Flash deals</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[300px] px-2 text-sm leading-relaxed text-white/70 sm:max-w-none sm:text-base">First come, first served. When a deal sells out, it&apos;s gone.</p>
        </motion.div>

        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {cards.map(({ deal, product }) => (
            <DealCard key={`${deal.id}-${product._id}`} deal={deal} product={product} phase={phase} inCart={inCart.has(product._id)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
