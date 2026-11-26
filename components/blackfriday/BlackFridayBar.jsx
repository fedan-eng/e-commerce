"use client";
// components/blackfriday/BlackFridayBar.jsx — the strip above the navbar while Black Friday is on:
// "⚡ Black Friday flash deals · Free gifts + up to 50% off · Ends in 3d 22h 20m · Shop deals →".
// Before it starts it counts down to the start instead. Once it's over, `fallback` (the usual
// delivery note) shows again. Free Thursday delivery is paused during Black Friday, so the usual
// note is never shown while it runs.
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { blackFridayPhase } from "@/lib/blackFriday";
import { BF, useBlackFridayClock } from "./shared";

export default function BlackFridayBar({ fallback = null }) {
  const still = useReducedMotion();
  const clock = useBlackFridayClock();
  // Until the clock has started in the browser, go by the time the page was rendered
  const phase = clock.ready ? clock.phase : blackFridayPhase();
  if (phase === "over") return fallback;

  const time = clock.ready ? `${clock.d > 0 ? `${clock.d}d ` : ""}${clock.h}h ${String(clock.m).padStart(2, "0")}m` : "";

  return (
    <Link
      href="/#flash-deals"
      className="group relative flex w-full items-center justify-center gap-x-2 overflow-hidden bg-black px-4 py-[8px] text-[12px] font-semibold tracking-tight text-white"
    >
      {/* A green sheen sweeping across every few seconds */}
      {!still && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(34,211,107,0.28),transparent)]"
          animate={{ left: ["-35%", "135%"] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
        />
      )}
      <span className="relative flex items-center gap-1.5" style={{ color: BF.lime }}>
        <Zap size={13} fill="currentColor" aria-hidden />
        <span>Black Friday<span className="hidden sm:inline"> flash deals</span></span>
      </span>
      <span className="relative hidden text-white/40 sm:inline" aria-hidden>·</span>
      <span className="relative hidden sm:inline">Free gifts + up to 50% off</span>
      {time && (
        <>
          <span className="relative text-white/40" aria-hidden>·</span>
          <span className="relative text-white/80">
            {phase === "upcoming" ? "Starts in" : "Ends in"} <span className="font-mono font-bold tabular-nums text-white">{time}</span>
          </span>
        </>
      )}
      <span className="relative ml-1 hidden items-center gap-1 font-bold underline-offset-2 group-hover:underline md:inline-flex" style={{ color: BF.green }}>
        Shop deals <ArrowRight size={13} aria-hidden />
      </span>
    </Link>
  );
}
