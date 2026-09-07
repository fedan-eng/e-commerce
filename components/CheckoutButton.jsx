"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useCookieConsent } from "@/context/CookieConsentContext";

// Helper function to get or create custom session ID
function getOrCreateSessionId() {
  if (typeof window === 'undefined') {
    console.log('[Session ID] Running on server, skipping');
    return null;
  }

  const SESSION_COOKIE_NAME = 'fil_session_id';
  const match = document.cookie.match(new RegExp(`(^| )${SESSION_COOKIE_NAME}=([^;]+)`));

  if (match) {
    const sessionId = match[2];
    console.log('[Session ID] Found existing session ID:', sessionId);
    return sessionId;
  }

  // Generate new session ID
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('[Session ID] Generated new session ID:', sessionId);

  // Set cookie for 30 days
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; path=/; max-age=2592000; SameSite=Lax`;

  return sessionId;
}

// Helper function to get GA client_id from _ga cookie (fallback)
function getGAClientIdFromCookie() {
  if (typeof window === 'undefined') {
    console.log('[GA Cookie] Running on server, skipping cookie read');
    return null;
  }
  console.log('[GA Cookie] All cookies:', document.cookie);
  const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  const clientId = match ? match[1] : null;
  console.log('[GA Cookie] Client ID from _ga cookie:', clientId);
  return clientId;
}

// Helper function to get GA client_id with timeout and fallback
async function getGAClientId(preferences, status) {
  try {
    // Check if analytics consent is given
    const canTrack = status === 'accepted' ||
                     (status === 'customized' && preferences.analytics);

    if (!canTrack) {
      console.log('[GA] Analytics consent not given, using custom session ID');
      const sessionId = getOrCreateSessionId();
      return sessionId; // Use custom session ID as fallback
    }

    console.log('[GA] Analytics consent given, attempting gtag method');
    console.log('[GA] GA ID:', process.env.NEXT_PUBLIC_GA_ID);
    console.log('[GA] window.gtag available:', typeof window.gtag);

    const clientId = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('[GA] gtag timeout, trying cookie fallback');
        reject(new Error('GA timeout'));
      }, 3000);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('get', process.env.NEXT_PUBLIC_GA_ID, 'client_id', (clientId) => {
          clearTimeout(timeout);
          console.log('[GA] Raw client_id received from gtag:', clientId);
          resolve(clientId);
        });
      } else {
        clearTimeout(timeout);
        console.log('[GA] gtag not available, trying cookie fallback');
        reject(new Error('GA not available'));
      }
    });

    if (clientId) {
      console.log('[GA] Successfully captured client_id via gtag:', clientId);
      return clientId;
    } else {
      console.log('[GA] gtag returned null, using GA cookie fallback');
      const cookieClientId = getGAClientIdFromCookie();
      return cookieClientId || getOrCreateSessionId();
    }
  } catch (error) {
    console.warn('[GA] gtag method failed:', error.message, 'trying fallback chain');
    // Fallback chain: GA cookie -> custom session ID
    const cookieClientId = getGAClientIdFromCookie();
    if (cookieClientId) {
      console.log('[GA] Cookie fallback successful:', cookieClientId);
      return cookieClientId;
    }
    console.log('[GA] Cookie fallback failed, using custom session ID');
    return getOrCreateSessionId();
  }
}

export default function CheckoutButton() {
  const { items } = useSelector((state) => state.cart);
  const router = useRouter();
  const { trackInitiateCheckout } = useTikTokEvent();
  const { preferences, status } = useCookieConsent();

  const [user, setUser] = useState(null); // e.g., { email, address }

  useEffect(() => {
    // Fetch user details from backend (via token stored in cookie)
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me"); // adjust to your route
        setUser(res.data.user);
      } catch (err) {
        setUser(null); // Not signed in
      }
    };

    fetchUser();
  }, []);

  const handleCheckout = async () => {
    try {
      let email, address;

      if (user) {
        email = user.email;
        address = user.address;
      } else {
        // Prompt for email and address
        email = prompt("Enter your email:");
        address = prompt("Enter your delivery address:");
        if (!email || !address) return alert("Email and address are required.");
      }

      // Calculate total value for events
      const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Track TikTok InitiateCheckout event
      trackInitiateCheckout(items, totalValue);

      // Capture GA client_id before redirecting to Paystack
      console.log('[CheckoutButton] Starting GA client_id capture process...');
      console.log('[CheckoutButton] Cookie consent status:', status);
      console.log('[CheckoutButton] Cookie preferences:', preferences);
      console.log('[CheckoutButton] GA ID from env:', process.env.NEXT_PUBLIC_GA_ID);

      const gaClientId = await getGAClientId(preferences, status);
      console.log('[CheckoutButton] Final GA client_id captured:', gaClientId);
      console.log('[CheckoutButton] Sending to server with metadata...');

      const res = await axios.post("/api/paystack", {
        items,
        email,
        address,
        userId: user?._id || null,
        gaClientId, // Send GA client_id to server
        debugInfo: {
          consentStatus: status,
          hasGaCookie: typeof document !== 'undefined' && document.cookie.includes('_ga'),
          hasSessionCookie: typeof document !== 'undefined' && document.cookie.includes('fil_session_id'),
          windowGtagAvailable: typeof window !== 'undefined' && typeof window.gtag === 'function',
          envGaId: process.env.NEXT_PUBLIC_GA_ID,
          clientIdSource: gaClientId?.startsWith('sess_') ? 'custom_session' : 'ga',
        }, // Send debug info to server
      });

      if (res.data?.authorization_url) {
        router.push(res.data.authorization_url);
      } else {
        alert("Failed to initiate payment.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-mustard hover:bg-yellow-600 px-4 py-2 rounded text-white"
    >
      Proceed to Checkout
    </button>
  );
}
