"use client";

import { useState } from "react";

export default function PromoCodeInput({ subTotal, onApply }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/promocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subTotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid promo code");
        setDiscount(0);
        onApply(0);
        return;
      }

      const discountAmount = (subTotal * data.discount) / 100;

      setDiscount(discountAmount);
      onApply(discountAmount); // notify parent with ₦ saved
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
          onChange={(e) => setCode(e.target.value)}
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
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      {discount > 0 && (
        <p className="mt-2 text-green-600 text-sm">
          🎉 Promo applied! You saved ₦{discount.toLocaleString()}
        </p>
      )}
    </div>
  );
}
