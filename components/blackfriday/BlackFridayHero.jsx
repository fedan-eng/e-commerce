"use client";
// components/blackfriday/BlackFridayHero.jsx — the homepage hero while Black Friday is on (one
// static slide, not a carousel). Counts down to Fri 27 Nov ("Starts in"), then to the end of
// Sun 29 Nov ("Ends in"). The art is the deal products' own photos bursting out of a glowing box.
// Hides itself once Black Friday is over (the page swaps back to the normal hero on its next rebuild).
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import useDeals from "@/hooks/useDeals";
import { BF, Confetti, DealArt, GREEN_TEXT, useBlackFridayClock } from "./shared";

const pad = (n) => String(n).padStart(2, "0");

function Countdown() {
  const { ready, phase, d, h, m, s } = useBlackFridayClock();
  const units = [[d, "d"], [h, "h"], [m, "m"], [s, "s"]];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10 backdrop-blur-sm sm:gap-2.5 sm:px-4"
      role="timer"
      aria-live="off"
      aria-label={ready ? `${phase === "upcoming" ? "Starts" : "Ends"} in ${d} days ${h} hours ${m} minutes` : undefined}
    >
      <span className="mr-1 text-[13px] font-semibold text-white/80 sm:text-sm">{phase === "upcoming" ? "Starts in" : "Ends in"}</span>
      {units.map(([n, u]) => (
        <span key={u} className="flex items-baseline gap-1">
          <span className="flex h-8 min-w-[34px] items-center justify-center rounded-lg bg-white px-1.5 font-mono text-lg font-bold tabular-nums text-black sm:h-9 sm:min-w-[38px] sm:text-xl">
            {ready ? pad(n) : "--"}
          </span>
          <span className="text-xs text-white/70">{u}</span>
        </span>
      ))}
    </div>
  );
}

// The open box the products burst out of: dark sides, a glowing rim and a gold ribbon
function GlowBox() {
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 mx-auto h-[26%] w-[78%] max-w-[520px]">
      <div className="absolute inset-x-[-6%] -top-3 h-6 rounded-[50%] bg-[#22d36b] opacity-80 blur-md" />
      <div className="absolute inset-x-0 top-0 h-3 rounded-t-md bg-[linear-gradient(180deg,#8bf5b4,#22d36b)] shadow-[0_0_40px_12px_rgba(34,211,107,0.55)]" />
      <div className="absolute inset-x-0 bottom-0 top-3 bg-[linear-gradient(180deg,#0f1712,#050806)]" />
      <div className="absolute bottom-0 top-3 left-[68%] w-[6%] bg-[linear-gradient(90deg,#a87a1c,#f3d27a,#a87a1c)]" />
    </div>
  );
}

export default function BlackFridayHero({ initialDeals = [] }) {
  const still = useReducedMotion();
  const { all, loaded } = useDeals(initialDeals);
  const { phase: clockPhase, ready } = useBlackFridayClock();
  if (ready && clockPhase === "over") return null;

  // One photo per product, deal order, gifts' products first so the hero shows the freebies' hosts
  const seen = new Set();
  const art = [];
  for (const deal of all) {
    for (const p of deal.products) {
      if (!p.image || seen.has(p._id)) continue;
      seen.add(p._id);
      art.push({ key: p._id, image: p.image, name: p.name });
    }
  }
  // Biggest in the middle: lead with a power bank-ish product if one is there
  const lead = art.findIndex((a) => /mag|thunder|power/i.test(a.name));
  if (lead > 0) art.unshift(art.splice(lead, 1)[0]);

  const scrollToDeals = (e) => {
    const el = document.getElementById("flash-deals");
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  };

  return (
    <section
      aria-label="Black Friday flash deals"
      className="relative isolate overflow-hidden text-white"
      style={{ background: `radial-gradient(ellipse 70% 60% at 50% 105%, rgba(34,211,107,0.45), transparent 70%), radial-gradient(ellipse 60% 50% at 50% -10%, rgba(34,211,107,0.18), transparent 70%), ${BF.bg}` }}
    >
      {/* Spotlight cone from the top */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-full w-[70%] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_75%)] [clip-path:polygon(35%_0,65%_0,100%_100%,0_100%)]" />
      <Confetti />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-2 px-4 pt-8 sm:px-6 md:grid-cols-2 md:gap-8 md:pt-14 lg:px-10">
        <motion.div
          initial={still ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 md:pb-16"
        >
          <Countdown />
          <h1 className="mt-5 text-[46px] font-black uppercase leading-[0.95] tracking-tight sm:text-[64px] lg:text-[88px]">
            Black <span className={GREEN_TEXT}>Friday</span>
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-white/80 sm:text-lg">Free gifts + up to 50% off. First come, first served.</p>
          <a
            href="#flash-deals"
            onClick={scrollToDeals}
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-bold shadow-[0_10px_30px_rgba(34,211,107,0.35)] transition-transform hover:scale-[1.03] active:scale-95"
            style={{ background: BF.green, color: BF.ink }}
          >
            {loaded && clockPhase === "live" ? "Shop flash deals" : "See the flash deals"} <ArrowRight size={18} />
          </a>
        </motion.div>

        <div className="relative h-[300px] sm:h-[380px] md:h-[460px]">
          <GlowBox />
          <div className="absolute inset-x-0 bottom-[16%] top-0">
            <DealArt items={art} className="h-full" ring={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
