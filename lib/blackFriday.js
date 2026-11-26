// lib/blackFriday.js — the Black Friday flash deal window (Lagos time, UTC+1), shared by the
// header bar, the deals popup, checkout and the server. No imports, so it runs anywhere.

export const BLACK_FRIDAY_START = new Date("2026-11-26T00:00:00+01:00");
export const BLACK_FRIDAY_END = new Date("2026-11-29T00:00:00+01:00"); // end of Sun 29 Nov

// "upcoming" (teaser), "live" or "over"
export function blackFridayPhase(now = new Date()) {
  if (now < BLACK_FRIDAY_START) return "upcoming";
  if (now < BLACK_FRIDAY_END) return "live";
  return "over";
}

export const isBlackFridayLive = (now = new Date()) => blackFridayPhase(now) === "live";

// The dates as the storefront shows them ("Fri 27 – Sun 29 Nov")
export const BLACK_FRIDAY_LABEL = "Fri 27 – Sun 29 Nov";
