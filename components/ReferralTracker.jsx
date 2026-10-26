"use client";
// Picks up ?ref=CODE on whatever page a creator's link opens, remembers the code for checkout
// (lib/referral.js) and tells the shopper it's saved. Renders nothing.
import { useEffect } from "react";
import toast from "react-hot-toast";
import { setReferral, trackReferral } from "@/lib/referral";

export default function ReferralTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("ref");
    if (!raw) return;

    // Tidy the address bar so a refresh or a shared link doesn't re-trigger this
    url.searchParams.delete("ref");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);

    trackReferral("click", raw.trim().toUpperCase()).then((res) => {
      if (!res?.valid) return;
      setReferral(res.code);
      const from = res.creatorName ? `${res.creatorName}'s code ` : "Code ";
      toast.success(`${from}${res.code} saved: ${res.discount}% off at checkout 🎉`, { duration: 5000 });
    });
  }, []);

  return null;
}
