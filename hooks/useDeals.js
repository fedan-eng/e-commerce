"use client";
// hooks/useDeals.js — the live Black Friday flash deals (/api/deals), fetched once per page
// load and shared by every component that asks. Empty outside the deal window.
import { useEffect, useState } from "react";
import { isBlackFridayLive } from "@/lib/blackFriday";

let cache = null; // { deals, byProduct, bundle }
let pending = null;
const EMPTY = { deals: [], byProduct: {}, bundle: null, loaded: false };

function load() {
  if (!pending) {
    pending = fetch("/api/deals")
      .then((res) => (res.ok ? res.json() : { deals: [] }))
      .catch(() => ({ deals: [] }))
      .then(({ deals = [], bundle = null }) => {
        const byProduct = {};
        for (const deal of deals) for (const p of deal.products) if (!byProduct[p._id]) byProduct[p._id] = deal;
        cache = { deals, byProduct, bundle, loaded: true };
        return cache;
      });
  }
  return pending;
}

export default function useDeals() {
  const [state, setState] = useState(cache || EMPTY);
  useEffect(() => {
    if (cache || !isBlackFridayLive()) return;
    let alive = true;
    load().then((c) => alive && setState(c));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
