"use client";

// components/RouteLoader.jsx
// Shown by the route loading.jsx files while the next page renders. The line changes
// with the page being opened. It fades in after 150ms (see .route-loader in
// globals.css), so quick navigations never flash it, and pages still in the router
// cache skip loading.jsx altogether. MinimumLoader also shows it over every page change.

import { usePathname } from "next/navigation";

// First matching prefix wins, so keep more specific paths above shorter ones
const LINES = [
  ["/products/power-banks", "Charging up", "power banks"],
  ["/products/chargers", "Plugging in", "chargers"],
  ["/products/wearables", "Strapping on", "wearables"],
  ["/products/extensions", "Stretching out", "extensions"],
  ["/products/lifestyle", "Styling up", "lifestyle"],
  ["/products/", "Fetching", "the details"],
  ["/cart", "Counting", "your cart"],
  ["/checkout", "Securing", "checkout"],
  ["/profile", "Pulling up", "your profile"],
  ["/login", "Opening", "the door"],
  ["/register", "Opening", "the door"],
  ["/reset-password", "Finding", "your key"],
  ["/verify-email", "Checking", "your inbox"],
  ["/blog", "Brewing", "the blog"],
  ["/contact", "Finding", "the line"],
  ["/review", "Opening", "reviews"],
  ["/policies", "Reading", "the fine print"],
  ["/cookie-policy", "Reading", "the fine print"],
  ["/admin_console", "Booting", "the console"],
];

const FALLBACK = ["Think quality,", "think FIL"];

function lineFor(pathname) {
  const match = LINES.find(([prefix]) => pathname?.startsWith(prefix));
  return match ? match.slice(1) : FALLBACK;
}

// path: the page being opened, when it isn't the current one yet.
// instant: skip the 150ms wait (MinimumLoader is always meant to be seen).
export default function RouteLoader({ path, instant = false }) {
  const current = usePathname();
  const [lead, highlight] = lineFor(path || current);

  return (
    <div
      role="status"
      aria-busy="true"
      className={`${instant ? "" : "route-loader "}flex min-h-[60vh] w-full items-center justify-center px-4`}
    >
      <div className="w-full max-w-[280px] sm:max-w-[340px]">
        <p className="font-oswald text-xl uppercase tracking-wide text-ink sm:text-2xl">
          {lead} <span className="font-semibold text-forest">{highlight}</span>
        </p>
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-line">
          <div className="route-loader-bar h-full w-2/5 rounded-full bg-signal" />
        </div>
      </div>
    </div>
  );
}
