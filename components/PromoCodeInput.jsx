"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, Tag } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { getReferral } from "@/lib/referral";

// phone / email: the checkout's delivery details, so first-order codes are checked against them
export default function PromoCodeInput({ subTotal, onApply, userId, phone = "", email = "" }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [requiresLogin, setRequiresLogin] = useState(false);

  // A creator's link (?ref=) fills their code in and applies it straight away
  useEffect(() => {
    const ref = getReferral();
    if (ref) {
      setCode(ref);
      handleApply(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = async (value = code) => {
    if (!value.trim()) {
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
          code: value,
          cartValue: subTotal,
          userId: userId || null,
          phone,
          email,
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
        onApply({ promoCode: null, amount: 0 });
        return;
      }

      const discountAmount = (subTotal * data.discount) / 100;
      setDiscount(discountAmount);
      onApply({ promoCode: value.toUpperCase(), amount: discountAmount });
    } catch (err) {
      setError("Something went wrong, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            aria-label="Promo code"
            placeholder="Promo code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
              setRequiresLogin(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="h-12 w-full rounded-full border border-transparent bg-sage pl-10 pr-4 text-[15px] font-medium tracking-wide text-forest outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-muted/70 focus:border-forest focus:bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => handleApply()}
          disabled={loading}
          className="h-12 shrink-0 rounded-full bg-mint px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-[#b9f0d0] disabled:opacity-50"
        >
          {loading ? "Applying…" : "Apply"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {requiresLogin && (
        <p className="mt-2 text-sm text-muted">
          This code is for members.{" "}
          <Link href="/login?callbackUrl=/cart" className="font-semibold text-forest underline underline-offset-2">
            Log in to use it
          </Link>
        </p>
      )}

      {discount > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#0b9a52]">
          <CircleCheck size={16} /> Promo applied, you save {formatAmount(discount)}
        </p>
      )}
    </div>
  );
}
