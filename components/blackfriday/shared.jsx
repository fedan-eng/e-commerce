"use client";
// components/blackfriday/shared.jsx — pieces shared by the Black Friday hero, the Flash Deals grid
// and the deal popups: the countdown clock, the date pill, deal wording, and the product art
// (real product photos on a glowing ring, each bouncing on its own beat).
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BLACK_FRIDAY_END, BLACK_FRIDAY_LABEL, BLACK_FRIDAY_START, blackFridayPhase } from "@/lib/blackFriday";

export const BF = {
  green: "#22d36b", // buttons, "FRIDAY"
  lime: "#d4f25a", // FREE tags, gift headings
  ink: "#04140b", // text on green buttons
  bg: "#050b07",
};

// Green text with the mockups' dark-to-bright sweep
export const GREEN_TEXT = "bg-[linear-gradient(90deg,#15a34a_0%,#22d36b_45%,#a3e635_100%)] bg-clip-text text-transparent";

// "FIL MagFlex 10,000mAh" → "MagFlex", "FIL Odogwu Buds" → "Odogwu Buds"
export function shortName(name = "") {
  return String(name)
    .replace(/^FIL\s+/i, "")
    .replace(/\s*\d[\d,.]*\s*mAh.*$/i, "")
    .replace(/\s+power\s*bank$/i, "")
    .trim();
}

// "MagSafe", "MagSafe and MagSnap", "A, B and C"
export function joinNames(names) {
  const list = [...new Set(names.filter(Boolean))];
  if (list.length <= 1) return list[0] || "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

// "cord" → "cord"; "charger and cord" → "charger + cord" (for headings)
export const giftLabel = (gift = "") => String(gift).replace(/^free\s+/i, "").replace(/\s+and\s+/gi, " + ").trim();

// The line under a deal card: "First 20 buyers get a free cord" / "First 30 buyers get 35% off"
export function dealBlurb(deal) {
  return deal.type === "gift"
    ? `First ${deal.quota} buyers get a free ${giftLabel(deal.gift)}`
    : `First ${deal.quota} buyers get ${deal.percent}% off`;
}

// Counts to the start of Black Friday, then to its end. { phase, d, h, m, s }
export function useBlackFridayClock() {
  const [now, setNow] = useState(null); // null on the server, so the first render matches
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const at = now ?? BLACK_FRIDAY_START.getTime() - 1;
  const phase = blackFridayPhase(new Date(at));
  const target = phase === "upcoming" ? BLACK_FRIDAY_START.getTime() : BLACK_FRIDAY_END.getTime();
  const ms = Math.max(0, target - at);
  return {
    ready: now !== null,
    phase,
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

// "● Fri 27 – Sun 29 Nov"
export function DatePill({ prefix = "", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 ${className}`}>
      <span className="h-2 w-2 rounded-full bg-[#ff3b3b] shadow-[0_0_8px_#ff3b3b]" aria-hidden />
      {prefix}
      {BLACK_FRIDAY_LABEL}
    </span>
  );
}

/**
 * Product photos floating above a glowing green ring. items: [{ key, image, name, tag? }]
 * The first item sits in the middle and biggest; the rest fan out to the sides.
 * Each one pops in, then bounces on its own timing.
 */
const SPOTS = [
  { x: 50, y: 50, w: 44, z: 5 },
  { x: 24, y: 56, w: 32, z: 4 },
  { x: 76, y: 56, w: 32, z: 4 },
  { x: 12, y: 30, w: 24, z: 3 },
  { x: 88, y: 30, w: 24, z: 3 },
];

export function DealArt({ items, className = "h-[190px]", ring = true }) {
  const still = useReducedMotion();
  const shown = items.slice(0, SPOTS.length);
  return (
    <div className={`relative w-full ${className}`}>
      {ring && (
        <>
          <div aria-hidden className="absolute inset-x-[6%] bottom-[6%] h-[34%] rounded-[50%] border-2 border-[#22d36b]/70 shadow-[0_0_24px_rgba(34,211,107,0.55),inset_0_0_24px_rgba(34,211,107,0.35)]" />
          <div aria-hidden className="absolute inset-x-[16%] bottom-[10%] h-[24%] rounded-[50%] bg-[#22d36b]/25 blur-2xl" />
        </>
      )}
      {shown.map((item, i) => {
        const spot = SPOTS[i];
        return (
          <motion.div
            key={item.key}
            className="absolute"
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: "78%", zIndex: spot.z, x: "-50%", y: "-50%" }}
            initial={still ? false : { scale: 0.3, opacity: 0, y: "-30%" }}
            animate={{ scale: 1, opacity: 1, y: "-50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.08 * i }}
          >
            <motion.div
              className="relative h-full w-full"
              animate={still ? undefined : { y: [0, -10, 0, -4, 0], rotate: [0, i % 2 ? 3 : -3, 0, i % 2 ? -1.5 : 1.5, 0] }}
              transition={{ duration: 1.6, delay: 0.6 + i * 0.27, repeat: Infinity, repeatDelay: 0.9 + (i % 3) * 0.35, ease: "easeInOut" }}
            >
              {item.image && (
                <Image src={item.image} alt={item.name || ""} fill sizes="180px" className="object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.55)]" />
              )}
              {item.tag && (
                <span className="absolute -top-1 right-0 rotate-[-8deg] rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-black shadow-md" style={{ background: BF.lime }}>
                  {item.tag}
                </span>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Little gold, green and white flecks drifting about (decoration)
const FLECKS = [
  [6, 12, "#e8c35a", 18], [18, 34, "#22d36b", -30], [30, 8, "#ffffff", 40], [44, 26, "#e8c35a", -12],
  [58, 14, "#22d36b", 25], [70, 30, "#ffffff", -40], [82, 10, "#e8c35a", 10], [92, 38, "#22d36b", 60],
  [12, 60, "#ffffff", -20], [88, 62, "#e8c35a", 35], [36, 46, "#22d36b", 15], [64, 52, "#ffffff", -55],
];

export function Confetti() {
  const still = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLECKS.map(([x, y, color, r], i) => (
        <motion.span
          key={i}
          className="absolute h-2.5 w-1 rounded-[1px]"
          style={{ left: `${x}%`, top: `${y}%`, background: color, rotate: r, opacity: 0.85 }}
          animate={still ? undefined : { y: [0, 10, 0], rotate: [r, r + 40, r] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
