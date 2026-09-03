"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useGAEvent } from "@/hooks/useGAEvent";

// Helper function to get GA client_id with timeout and fallback
async function getGAClientId() {
  try {
    const clientId = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('GA timeout')), 3000);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('get', process.env.NEXT_PUBLIC_GA_ID, 'client_id', (clientId) => {
          clearTimeout(timeout);
          resolve(clientId);
        });
      } else {
        clearTimeout(timeout);
        reject(new Error('GA not available'));
      }
    });
    console.log('[GA] Successfully captured client_id:', clientId);
    return clientId;
  } catch (error) {
    console.warn('[GA] Failed to capture client_id:', error.message);
    return null; // fallback — payment still works, just without session attribution
  }
}

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

      // Capture GA client_id before redirecting to Paystack
      const gaClientId = await getGAClientId();
      console.log('[CheckoutButton] GA client_id captured:', gaClientId);

      const res = await axios.post("/api/paystack", {
        items,
        email,
        address,
        userId: user?._id || null,
        gaClientId, // Send GA client_id to server
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
