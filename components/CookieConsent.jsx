"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CookieConsent() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const [isMounted, setIsMounted] = useState(false);
  const [consentStatus, setConsentStatus] = useState(null); // null | "accepted" | "declined"

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("cookieConsent");
      if (saved === "accepted" || saved === "declined") {
        setConsentStatus(saved);
      } else {
        setConsentStatus(null);
      }
    } catch (e) {
      setConsentStatus(null);
    }
  }, []);

  if (!isMounted || isLoading) return null;
  if (isAuthenticated) return null; // only show for not-logged-in users
  if (consentStatus === "accepted" || consentStatus === "declined") return null;

  const handleAccept = () => {
    try {
      localStorage.setItem("cookieConsent", "accepted");
    } catch (e) {
      // ignore localStorage fail
    }
    setConsentStatus("accepted");
  };

  const handleDecline = async () => {
    try {
      localStorage.setItem("cookieConsent", "declined");
    } catch (e) {
      // ignore localStorage fail
    }

    // If a token cookie exists, clear it server-side via logout endpoint.
    // Non-auth users will get 401 (safe to ignore).
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore network errors for this optional behavior
    }

    setConsentStatus("declined");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        color: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        padding: "16px 20px",
        maxWidth: "360px",
        width: "calc(100vw - 40px)",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
      aria-live="polite"
      role="dialog"
    >
      <p style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: "1.5" }}>
        We use cookies to improve your experience. By clicking "Accept" you agree to optional cookies.
        Click "Decline" to continue without optional cookies.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          onClick={handleDecline}
          style={{
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 14px",
            border: "1px solid #7193b0",
            color: "#ffffff",
            backgroundColor: "transparent",
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 14px",
            border: "none",
            backgroundColor: "#22c55e",
            color: "#0f172a",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
