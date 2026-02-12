"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function CheckoutButton() {
  const { items } = useSelector((state) => state.cart);
  const router = useRouter();

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

      const res = await axios.post("/api/paystack", {
        items,
        email,
        address,
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
