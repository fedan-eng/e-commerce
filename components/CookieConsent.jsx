"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CookieConsent() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Controls the animation trigger
  const [consentStatus, setConsentStatus] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Check localStorage
    try { 
      const saved = localStorage.getItem("cookieConsent");
      if (saved === "accepted" || saved === "declined") {
        setConsentStatus(saved);
      } else {
        // Small delay before showing the banner for a better UX
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setIsVisible(true);
    }
  }, []);

  // Guard Clauses
  if (!isMounted) return null;
  if (isLoading || isAuthenticated || consentStatus !== null) return null;

  const handleAccept = () => {
    setIsVisible(false); // Slide out first
    setTimeout(() => {
      try { localStorage.setItem("cookieConsent", "accepted"); } catch (e) {}
      setConsentStatus("accepted");
    }, 400); // Wait for animation to finish
  };

  const handleDecline = async () => {
    setIsVisible(false); // Slide out first
    setTimeout(async () => {
      try {
        localStorage.setItem("cookieConsent", "declined");
        setConsentStatus("declined");
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        setConsentStatus("declined");
      }
    }, 400);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 99999,
        backgroundColor: "rgba(15, 23, 42, 0.98)",
        color: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        padding: "24px",
        maxWidth: "400px",
        width: "calc(100vw - 40px)",
        fontFamily: "Inter, system-ui, sans-serif",
        border: "1px solid rgba(255,255,255,0.1)",
        
        // --- ANIMATION LOGIC ---
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isVisible ? "translateY(0)" : "translateY(100px)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "all" : "none",
      }}
      aria-live="polite"
      role="dialog"
    >
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700 }}>
          Cookie Preferences 🍪
        </h4>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "#cbd5e1" }}>
          We use cookies to improve your experience at FIL Store. Choose your preference below to continue.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          onClick={handleDecline}
          style={{
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "10px",
            padding: "10px 18px",
            border: "1px solid #475569",
            color: "#ffffff",
            backgroundColor: "transparent",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "10px",
            padding: "10px 18px",
            border: "none",
            backgroundColor: "#22c55e",
            color: "#0f172a",
            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}