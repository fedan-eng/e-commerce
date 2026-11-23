"use client";
// components/BlackFridayBar.jsx — the strip above the navbar. Before Black Friday it's a black
// teaser, during it a black bar that opens the deals popup, and afterwards the usual delivery note.
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { blackFridayPhase } from "@/lib/blackFriday";
import { OPEN_DEALS_EVENT } from "@/components/BlackFridayPopup";

export default function BlackFridayBar() {
  // The page can be cached for a while, so check the date again in the browser
  const [phase, setPhase] = useState(() => blackFridayPhase());
  useEffect(() => {
    setPhase(blackFridayPhase());
    const t = setInterval(() => setPhase(blackFridayPhase()), 60000);
    return () => clearInterval(t);
  }, []);

  if (phase === "over") {
    return (
      <div className="flex w-full items-center justify-center bg-[#c6e8b9] px-4 py-[8px]">
        <span className="text-center text-[12px] font-medium tracking-tight text-[#1a1a1a]">
          All deliveries in Lagos are free on Thursday but express deliveries are priced
        </span>
      </div>
    );
  }

  const live = phase === "live";
  return (
    <button
      type="button"
      onClick={() => live && window.dispatchEvent(new Event(OPEN_DEALS_EVENT))}
      className={`flex w-full items-center justify-center gap-2 bg-black px-4 py-[9px] text-white ${live ? "cursor-pointer" : "cursor-default"}`}
    >
      <Zap size={14} className="shrink-0 text-[#ffd95d]" fill="currentColor" />
      <span className="text-center text-[12px] font-medium tracking-tight">
        <span className="font-extrabold uppercase tracking-[0.12em] text-[#ffd95d]">Black Friday</span>
        {live ? (
          <>
            {" "}· Flash deals live till Sunday · <span className="font-semibold underline underline-offset-2">Grab it now</span>
          </>
        ) : (
          <> · Flash deals start Fri 27 Nov · Free gifts and up to 50% off</>
        )}
      </span>
    </button>
  );
}
