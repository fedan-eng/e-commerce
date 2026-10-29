"use client";

// components/MinimumLoader.jsx
// Covers the store with the RouteLoader line for at least 3 seconds on the first visit and
// on every page change, even when the page is already there, so the loader is always seen.
// The page renders underneath meanwhile. Starts on the link click (or back/forward), so the
// line is for the page being opened; router.push navigations are caught when the path changes.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import RouteLoader from "@/components/RouteLoader";

const MIN_MS = 3000;
const MAX_MS = 10000; // a navigation that never lands (cancelled, failed) still lets go
const FADE_MS = 300;

function internalPath(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = e.target.closest?.("a[href]");
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return null;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return null;
  return url.pathname;
}

export default function MinimumLoader() {
  const pathname = usePathname();
  // { path, at } while showing; visible from the server render on the first visit
  const [run, setRun] = useState({ path: pathname, at: 0 });
  const [leaving, setLeaving] = useState(false);
  const target = useRef(pathname);

  const start = (path) => {
    target.current = path;
    setLeaving(false);
    setRun({ path, at: Date.now() });
  };

  // The first visit's clock starts once the page is interactive
  useEffect(() => {
    setRun((r) => (r && !r.at ? { ...r, at: Date.now() } : r));
  }, []);

  useEffect(() => {
    // Capture phase: before next/link handles the click
    const onClick = (e) => {
      const path = internalPath(e);
      if (path) start(path);
    };
    const onPop = () => start(window.location.pathname);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // Landed somewhere we didn't expect: router.push, or a redirect (e.g. to /login)
  useEffect(() => {
    if (pathname === target.current) return;
    target.current = pathname;
    setRun((r) => (r ? { ...r, path: pathname } : { path: pathname, at: Date.now() }));
    setLeaving(false);
  }, [pathname]);

  // Let go once we're on the page and 3s have passed since it started
  useEffect(() => {
    if (!run?.at) return;
    const elapsed = Date.now() - run.at;
    const wait = pathname === run.path ? MIN_MS - elapsed : MAX_MS - elapsed;
    const t = setTimeout(() => setLeaving(true), Math.max(0, wait));
    return () => clearTimeout(t);
  }, [run, pathname]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setRun(null), FADE_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  if (!run) return null;

  return (
    <div
      className={`fixed inset-0 z-[10001] flex items-center justify-center bg-white transition-opacity duration-300 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
      aria-live="polite"
    >
      <RouteLoader path={run.path} instant />
    </div>
  );
}
