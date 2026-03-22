"use client";

import { useState } from "react";
import Link from "next/link";

export default function PromoCodeInput({ subTotal, onApply, userId }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [requiresLogin, setRequiresLogin] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return;
    }

    setLoading(true);
    setError("");
    setRequiresLogin(false);

    try {
      const res = await fetch("/api/promocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cartValue: subTotal,
          userId: userId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setRequiresLogin(true);
        } else {
          setError(data.message || "Invalid promo code");
        }
        setDiscount(0);
        onApply(0);
        return;
      }

      const discountAmount = (subTotal * data.discount) / 100;
      setDiscount(discountAmount);
      onApply(discountAmount);
    } catch (err) {
      setError("Something went wrong, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end gap-[10px] rounded-md w-full">
        <input
          type="text"
          placeholder="Enter Promo Code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
            setRequiresLogin(false);
          }}
          className="bg-[#f7f7f7] p-3 rounded-md outline-0 w-full placeholder-text-[#3e3e3e] text-sm"
        />
        <button
          onClick={handleApply}
          disabled={loading}
          className="bg-filgreen disabled:opacity-50 px-[18px] py-3 rounded-md font-roboto text-sm"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>

      {/* Regular error */}
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

      {/* Login required message with link */}
      {requiresLogin && (
        <p className="mt-2 text-red-500 text-sm">
          Please{" "}
          <Link href="/login" className="underline text-filgreen font-medium">
            log in
          </Link>{" "}
          to use this promo code.
        </p>
      )}

      {/* Success message */}
      {discount > 0 && (
        <p className="mt-2 text-green-600 text-sm">
          🎉 Promo applied! You saved ₦{discount.toLocaleString()}
        </p>
      )}
    </div>
  );
}