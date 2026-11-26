"use client";
// hooks/useDeals.js — the Black Friday flash deals (/api/deals, lib/deals.js getDealCards), fetched
// once per page load and shared by every component that asks.
//   all:       every deal, sold-out ones included (soldOut: true); a preview before 27 Nov
//   deals:     the ones that can still be bought right now (live and not sold out)
//   byProduct: { [productId]: deal } for `deals` — what sets prices, so it's empty unless live
//   phase:     "upcoming" | "live" | "over"
// `initial` (the landing page's server copy) is shown until the fresh counts arrive.
import { useEffect, useState } from "react";
import { blackFridayPhase } from "@/lib/blackFriday";

let cache = null;
let pending = null;
const EMPTY = { all: [], deals: [], byProduct: {}, phase: "over", loaded: false };

function shape(all = [], phase = blackFridayPhase()) {
  const live = phase === "live" ? all.filter((d) => !d.soldOut) : [];
  const byProduct = {};
  for (const deal of live) for (const p of deal.products) if (!byProduct[p._id]) byProduct[p._id] = deal;
  return { all, deals: live, byProduct, phase, loaded: true };
}

function load() {
  if (!pending) {
    pending = fetch("/api/deals")
      .then((res) => (res.ok ? res.json() : { deals: [] }))
      .catch(() => ({ deals: [] }))
      .then(({ deals = [] }) => {
        cache = shape(deals);
        return cache;
      });
  }
  return pending;
}

export default function useDeals(initial = null) {
  const [state, setState] = useState(() => cache || (initial ? { ...shape(initial), loaded: false } : EMPTY));
  useEffect(() => {
    if (cache) {
      setState(cache);
      return;
    }
    if (blackFridayPhase() === "over") return;
    let alive = true;
    load().then((c) => alive && setState(c));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
