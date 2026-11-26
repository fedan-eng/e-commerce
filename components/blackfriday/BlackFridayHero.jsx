"use client";
// components/blackfriday/BlackFridayHero.jsx — the homepage hero while Black Friday is on (one
// static slide, not a carousel). Counts down to the start ("Starts in"), then to the end of
// Sun 29 Nov ("Ends in"). The art is the deal products' own photos bursting out of an open,
// glowing gift box. Hides itself once Black Friday is over (the page swaps back to the normal
// hero on its next rebuild).
//
// Motion: the headline rises in word by word; the products launch out of the box one after
// another, then float on their own slow rhythm while sparkles drift up from the box; on desktop
// the art leans gently towards the mouse. The countdown digits roll as they change. All of it
// is skipped for "reduce motion". The bottom fades into the Flash Deals section below.
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import useDeals from "@/hooks/useDeals";
import { BF, Confetti, useBlackFridayClock } from "./shared";

const EASE = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, "0");

// ── Countdown ─────────────────────────────────────────────────────────────────────────────

function Digit({ value, still }) {
  return (
    <span className="relative flex h-9 min-w-[38px] items-center justify-center overflow-hidden rounded-lg bg-white px-1.5 font-mono text-lg font-bold tabular-nums text-black shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)] sm:h-11 sm:min-w-[46px] sm:text-2xl">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={still ? false : { y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={still ? undefined : { y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Countdown({ still }) {
  const { ready, phase, d, h, m, s } = useBlackFridayClock();
  const units = [[d, "d"], [h, "h"], [m, "m"], [s, "s"]];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10 backdrop-blur-md sm:gap-2.5 sm:px-4 sm:py-2.5"
      role="timer"
      aria-live="off"
      aria-label={ready ? `${phase === "upcoming" ? "Starts" : "Ends"} in ${d} days ${h} hours ${m} minutes` : undefined}
    >
      <span className="mr-1 text-[13px] font-semibold text-white/80 sm:text-sm">{phase === "upcoming" ? "Starts in" : "Ends in"}</span>
      {units.map(([n, u]) => (
        <span key={u} className="flex items-baseline gap-1">
          <Digit value={ready ? pad(n) : "--"} still={still} />
          <span className="text-xs text-white/60">{u}</span>
        </span>
      ))}
    </div>
  );
}

// ── The box and what comes out of it ──────────────────────────────────────────────────────

// Where each product rests, fanned out of the box: centre biggest and highest, the outer ones
// smaller, lower and leaning out. x: centre as % of the stage; bottom: % up from the stage floor.
const SLOTS = [
  { x: 50, bottom: 30, w: 34, rotate: 0, depth: 1 },
  { x: 29, bottom: 27, w: 25, rotate: -11, depth: 0.7 },
  { x: 71, bottom: 27, w: 25, rotate: 11, depth: 0.7 },
  { x: 12, bottom: 40, w: 18, rotate: -20, depth: 0.45 },
  { x: 88, bottom: 40, w: 18, rotate: 20, depth: 0.45 },
];

function HeroProduct({ item, slot, index, mx, my, still }) {
  // Nearer products lean further with the mouse
  const px = useTransform(mx, [-1, 1], [-14 * slot.depth, 14 * slot.depth]);
  const py = useTransform(my, [-1, 1], [-8 * slot.depth, 8 * slot.depth]);
  const launch = 0.35 + index * 0.13;

  return (
    <motion.div
      className="absolute aspect-[3/4]"
      style={{ left: `${slot.x}%`, bottom: `${slot.bottom}%`, width: `${slot.w}%`, x: "-50%", zIndex: 10 - index }}
    >
      <motion.div style={{ x: px, y: py }} className="h-full w-full">
        {/* Out of the box… */}
        <motion.div
          className="h-full w-full origin-bottom"
          initial={still ? false : { y: "70%", scale: 0.35, rotate: 0, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: slot.rotate, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 13, mass: 0.9, delay: launch }}
        >
          {/* …then a slow float of its own */}
          <motion.div
            className="relative h-full w-full"
            animate={still ? undefined : { y: [0, -12, 0], rotate: [0, slot.rotate >= 0 ? 2 : -2, 0] }}
            transition={{ duration: 3.4 + index * 0.45, delay: launch + 0.9, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              priority={index < 3}
              sizes="(min-width: 768px) 220px, 34vw"
              className="object-contain drop-shadow-[0_22px_28px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Sparkles drifting up out of the box
const SPARKS = [[38, 0], [46, 1.1], [54, 0.5], [62, 1.7], [42, 2.3], [58, 2.9], [50, 3.4]];

function Sparks({ still }) {
  if (still) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[15]">
      {SPARKS.map(([x, delay], i) => (
        <motion.span
          key={i}
          className="absolute bottom-[30%] h-1.5 w-1.5 rounded-full bg-[#b8ffd6] shadow-[0_0_10px_3px_rgba(34,211,107,0.8)]"
          style={{ left: `${x}%` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-4, -170], x: [0, i % 2 ? 14 : -14], opacity: [0, 1, 0], scale: [0.6, 1, 0.4] }}
          transition={{ duration: 3.2, delay: 1.2 + delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// The open gift box: lid flaps folded back, a beam of light out of the top, a glowing rim,
// a gold ribbon down the front and a pool of green light on the floor
function GiftBox({ children, still }) {
  return (
    <div className="relative h-full w-full">
      {/* Floor glow */}
      <div aria-hidden className="absolute bottom-[2%] left-1/2 h-[16%] w-[95%] -translate-x-1/2 rounded-[50%] bg-[#22d36b]/35 blur-3xl" />

      {/* Beam of light up out of the box */}
      <motion.div
        aria-hidden
        className="absolute bottom-[26%] left-1/2 h-[80%] w-[78%] -translate-x-1/2 bg-[linear-gradient(0deg,rgba(120,255,180,0.38),rgba(34,211,107,0.12)_45%,transparent_85%)] [clip-path:polygon(22%_100%,78%_100%,100%_0,0_0)]"
        initial={still ? false : { opacity: 0, scaleY: 0.3 }}
        animate={{ opacity: 1, scaleY: 1 }}
        style={{ transformOrigin: "bottom" }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
      />

      {/* Lid flaps, folded back behind the products */}
      <div aria-hidden className="absolute bottom-[25%] left-[17%] h-[9%] w-[30%] origin-bottom-right -skew-x-[28deg] -rotate-[14deg] rounded-sm bg-[linear-gradient(180deg,#1a231d,#0b100d)] ring-1 ring-white/5" />
      <div aria-hidden className="absolute bottom-[25%] right-[17%] h-[9%] w-[30%] origin-bottom-left skew-x-[28deg] rotate-[14deg] rounded-sm bg-[linear-gradient(180deg,#1a231d,#0b100d)] ring-1 ring-white/5" />

      {children}
      <Sparks still={still} />

      {/* Box front (in front of the products, so they look like they come out of it) */}
      <div aria-hidden className="absolute bottom-[4%] left-1/2 z-20 h-[24%] w-[64%] -translate-x-1/2">
        <div className="absolute -inset-x-[3%] -top-2 h-4 rounded-[50%] bg-[#22d36b] opacity-90 blur-md" />
        <div className="absolute inset-x-0 top-0 h-[10px] rounded-t-md bg-[linear-gradient(180deg,#b7ffd4,#22d36b)] shadow-[0_0_36px_10px_rgba(34,211,107,0.55)]" />
        <div className="absolute inset-x-0 bottom-0 top-[10px] rounded-b-md bg-[linear-gradient(180deg,#141c17_0%,#070a08_100%)] shadow-[inset_0_14px_24px_rgba(34,211,107,0.18)]" />
        <div className="absolute bottom-0 left-1/2 top-[10px] w-[9%] -translate-x-1/2 bg-[linear-gradient(90deg,#8a6114,#f6d98a_45%,#c99a35_60%,#8a6114)]" />
        {/* Light catching the box's top edge */}
        {!still && (
          <motion.div
            className="absolute inset-x-0 top-0 h-[10px] overflow-hidden rounded-t-md"
            initial={false}
          >
            <motion.span
              className="absolute inset-y-0 w-1/4 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.85),transparent)]"
              animate={{ left: ["-30%", "130%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────────────────

export default function BlackFridayHero({ initialDeals = [] }) {
  const still = useReducedMotion();
  const { all, loaded } = useDeals(initialDeals);
  const { phase: clockPhase, ready } = useBlackFridayClock();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 16 });
  const my = useSpring(rawY, { stiffness: 60, damping: 16 });

  if (ready && clockPhase === "over") return null;

  // One photo per product, in deal order; a power bank leads, since it sits in the middle
  const seen = new Set();
  const art = [];
  for (const deal of all) {
    for (const p of deal.products) {
      if (!p.image || seen.has(p._id)) continue;
      seen.add(p._id);
      art.push({ key: p._id, image: p.image, name: p.name });
    }
  }
  const lead = art.findIndex((a) => /mag|thunder|power/i.test(a.name));
  if (lead > 0) art.unshift(art.splice(lead, 1)[0]);

  const onMove = (e) => {
    if (still || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width) * 2 - 1);
    rawY.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const scrollToDeals = (e) => {
    const el = document.getElementById("flash-deals");
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  };

  const word = (delay) => ({
    initial: still ? false : { opacity: 0, y: 40, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      aria-label="Black Friday flash deals"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate overflow-hidden text-white"
      style={{ background: BF.bg }}
    >
      {/* Soft green glows: top left behind the words, and under the box */}
      <div aria-hidden className="pointer-events-none absolute -left-[10%] -top-[20%] h-[70%] w-[60%] rounded-full bg-[#22d36b]/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[70%] w-full rounded-full bg-[#22d36b]/15 blur-[120px] md:w-[60%]" />
      <Confetti />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center px-4 pt-8 sm:px-6 md:grid-cols-[1fr_1.1fr] md:gap-6 md:pt-10 lg:px-10">
        <div className="relative z-10 md:pb-24">
          <motion.div {...word(0)}>
            <Countdown still={still} />
          </motion.div>
          <h1 className="mt-5 text-[50px] font-black uppercase leading-[0.92] tracking-tight sm:text-[72px] lg:text-[96px]">
            <motion.span className="inline-block" {...word(0.1)}>Black</motion.span>{" "}
            <motion.span
              className="inline-block bg-[linear-gradient(90deg,#15a34a_0%,#22d36b_30%,#a3e635_50%,#22d36b_70%,#15a34a_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              {...word(0.22)}
              animate={still ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: "blur(0px)", backgroundPosition: ["0% 50%", "200% 50%"] }}
              transition={{
                opacity: { duration: 0.7, delay: 0.22, ease: EASE },
                y: { duration: 0.7, delay: 0.22, ease: EASE },
                filter: { duration: 0.7, delay: 0.22, ease: EASE },
                backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" },
              }}
            >
              Friday
            </motion.span>
          </h1>
          <motion.p className="mt-4 max-w-md text-[15px] text-white/80 sm:text-lg" {...word(0.34)}>
            Free gifts + up to 50% off. First come, first served.
          </motion.p>
          <motion.div {...word(0.46)}>
            <a
              href="#flash-deals"
              onClick={scrollToDeals}
              className="group relative mt-6 inline-flex h-[52px] items-center gap-2 overflow-hidden rounded-full px-7 text-base font-bold shadow-[0_10px_34px_rgba(34,211,107,0.45)] transition-transform hover:scale-[1.03] active:scale-95"
              style={{ background: BF.green, color: BF.ink }}
            >
              {/* A sheen across the button every few seconds */}
              {!still && (
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]"
                  animate={{ left: ["-40%", "140%"] }}
                  transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 3, ease: "easeInOut", delay: 1.5 }}
                />
              )}
              <span className="relative">{loaded && clockPhase === "live" ? "Shop flash deals" : "See the flash deals"}</span>
              <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>

        <div className="relative -mx-4 h-[340px] sm:mx-0 sm:h-[420px] md:h-[520px]">
          <GiftBox still={still}>
            {art.slice(0, SLOTS.length).map((item, i) => (
              <HeroProduct key={item.key} item={item} slot={SLOTS[i]} index={i} mx={mx} my={my} still={still} />
            ))}
          </GiftBox>
        </div>
      </div>

      {/* Fades into the Flash Deals section below, so there's no hard edge */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-[linear-gradient(180deg,transparent,#050b07)]" />
    </section>
  );
}
