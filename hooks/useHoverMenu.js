"use client";
// Open/close state for navbar dropdowns: opens on hover or keyboard focus, closes on
// mouse-leave/blur (after a short delay so the cursor can travel into the panel),
// on Escape, and on navigation.
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function useHoverMenu(closeDelay = 120) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const pathname = usePathname();

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Spread onto the wrapper element
  const bind = { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide };

  return { open, setOpen, show, hide, bind };
}
