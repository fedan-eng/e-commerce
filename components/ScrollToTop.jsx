"use client";
// components/ScrollToTop.jsx — opens every new page at the top. Next.js only scrolls when the new
// page's top isn't already in view, which misses often enough that shoppers landed mid-page.
// Back/forward keep the browser's restored position, query-only changes (filters, tabs) don't
// move the page, and links to a #section are left to the browser.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
