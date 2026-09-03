"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useGAEvent } from "@/hooks/useGAEvent";

export default function CheckoutButton() {
  const { items } = useSelector((state) => state.cart);
  const router = useRouter();
  const { trackInitiateCheckout } = useTikTokEvent();
  const { trackEvent } = useGAEvent();

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
      
       // Track GA begin_checkout event
      trackEvent('begin_checkout', {
        currency: 'NGN',
        value: totalValue,
        items: items.map((item, index) => ({
          item_id: String(item._id || item.productId || index),
          item_name: item.name || 'Unknown',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          index,
        })),
      });

      // Track TikTok InitiateCheckout event
      trackInitiateCheckout(items, totalValue);

      // Capture GA client_id for server-side tracking
      let gaClientId = null;
      try {
        console.log('[GA DEBUG] Simple checkout: Attempting to capture GA client_id...');
        console.log('[GA DEBUG] Window gtag available:', typeof window !== 'undefined' && !!window.gtag);
        console.log('[GA DEBUG] GA ID:', process.env.NEXT_PUBLIC_GA_ID);

        if (typeof window !== 'undefined' && window.gtag) {
          gaClientId = await new Promise((resolve) => {
            // Set a timeout in case gtag('get') doesn't respond
            const timeout = setTimeout(() => {
              console.warn('[GA DEBUG] Simple checkout: GA client_id capture timed out, using fallback');
              resolve(null);
            }, 2000);

            window.gtag('get', process.env.NEXT_PUBLIC_GA_ID, 'client_id', (clientId) => {
              clearTimeout(timeout);
              console.log('[GA DEBUG] Simple checkout: Captured GA client_id:', clientId);
              resolve(clientId);
            });
          });
        }

        // Fallback: Try to read from GA cookie
        if (!gaClientId && typeof window !== 'undefined') {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === '_ga') {
              gaClientId = value;
              console.log('[GA DEBUG] Simple checkout: Fallback - Got GA client_id from _ga cookie:', gaClientId);
              break;
            }
          }
        }
      } catch (err) {
        console.warn('[GA DEBUG] Simple checkout: Failed to capture GA client_id:', err);
      }

      console.log('[GA DEBUG] Simple checkout: Final gaClientId being sent:', gaClientId);

      const res = await axios.post("/api/paystack", {
        items,
        email,
        address,
        userId: user?._id || null,
        gaClientId,
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
