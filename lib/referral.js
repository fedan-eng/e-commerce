// lib/referral.js — creator links in the browser.
// filstore.com.ng/anything?ref=DAMMY10 remembers DAMMY10 for 30 days (the fil_ref cookie):
// checkout fills the code in, and the order is credited to the creator even if they typed nothing.
// Visits and add-to-carts are logged to /api/ref only while analytics cookies are allowed.

export const REF_COOKIE = "fil_ref";
const REF_DAYS = 30;
const VISITOR_KEY = "fil_vid";
const CONSENT_KEY = "filstore_cookie_consent"; // context/CookieConsentContext.jsx

const isBrowser = () => typeof window !== "undefined";

export function getReferral() {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setReferral(code) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; Max-Age=${REF_DAYS * 86400}; Path=/; SameSite=Lax${secure}`;
}

// Analytics is on unless the shopper switched it off in the cookie settings
export function analyticsAllowed() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return saved?.preferences?.analytics !== false;
  } catch {
    return true;
  }
}

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Tells the server about a creator-link event. For "click" it also checks the code:
 * resolves to { valid, code, discount, creatorName } (or null on a network error).
 */
export async function trackReferral(type, code = getReferral()) {
  if (!isBrowser() || !code) return null;
  const track = analyticsAllowed();
  const id = track ? visitorId() : null;

  // A cart event only needs sending once a day per code; the server dedupes too
  if (type === "cart") {
    if (!id) return null;
    const key = `fil_ref_cart:${code}:${new Date().toDateString()}`;
    try {
      if (localStorage.getItem(key)) return null;
      localStorage.setItem(key, "1");
    } catch {}
  }

  try {
    const res = await fetch("/api/ref", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ code, type, visitorId: id, path: window.location.pathname }),
    });
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

// Redux middleware: every add-to-cart button goes through cart/addToCart
export const referralCartMiddleware = () => (next) => (action) => {
  const result = next(action);
  if (action.type === "cart/addToCart" && getReferral()) trackReferral("cart");
  return result;
};
