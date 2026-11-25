// components/cart/FlashDealParts.jsx — how Black Friday flash deals show on cart, checkout and
// order lines (lib/bundles.js flashDealPill / dealGift): the black "prices applied" strip, the
// "⚡ Flash deal −50%" pill, and the free gift on its own FREE row.
import Image from "next/image";
import { Gift, Zap } from "lucide-react";

export const BF_LIME = "#d4f25a";

export function FlashDealPill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-black px-2.5 py-[3px] text-[11px] font-semibold leading-none ${className}`}
      style={{ color: BF_LIME }}
    >
      <Zap size={11} fill="currentColor" aria-hidden /> {children}
    </span>
  );
}

// "⚡ Black Friday prices applied.  No code needed."
export function BlackFridayStrip({ className = "" }) {
  return (
    <p className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl bg-black px-4 py-3 text-[13px] font-semibold sm:text-sm ${className}`}>
      <span className="flex items-center gap-1.5" style={{ color: BF_LIME }}>
        <Zap size={15} fill="currentColor" aria-hidden /> Black Friday prices applied.
      </span>
      <span className="text-white">No code needed.</span>
    </p>
  );
}

// The free product that comes with a gift deal line. size: "md" in the cart, "sm" in summaries.
export function GiftRow({ gift, size = "md", as: Tag = "div" }) {
  if (!gift) return null;
  const box = size === "sm" ? "h-12 w-12 rounded-xl" : "h-16 w-16 rounded-2xl sm:h-20 sm:w-20";
  return (
    <Tag className="flex items-center gap-3 rounded-2xl bg-[#ecfbf1] px-3 py-2.5">
      <span className={`relative shrink-0 overflow-hidden bg-white ${box}`}>
        {gift.image ? (
          <Image src={gift.image} alt="" fill sizes="80px" className="object-contain p-1.5" />
        ) : (
          <Gift size={18} className="absolute inset-0 m-auto text-forest/50" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-forest">{gift.name}</p>
        <FlashDealPill className="mt-1">Flash deal gift</FlashDealPill>
      </div>
      <span className="shrink-0 text-sm font-bold text-[#16a34a]">FREE</span>
    </Tag>
  );
}
