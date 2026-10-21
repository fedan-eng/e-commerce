"use client";
// components/checkout/SaveAccountCard.jsx — on the order confirmation, lets a guest turn their
// checkout into an account: we email a code to the order's email, and once they enter it they're
// signed in with the delivery details saved. Their order then shows in My orders (matched by email).
import { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { updateUser } from "@/store/features/authSlice";
import CodeForm from "@/components/auth/CodeForm";

export default function SaveAccountCard({ order }) {
  const dispatch = useDispatch();
  const [step, setStep] = useState("offer"); // offer → code → done
  const [error, setError] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: order.email }),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  };

  const start = async () => {
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await requestCode();
      if (!ok) {
        setHasAccount(Boolean(data.hasAccount));
        setError(data.hasAccount ? "You already have a FIL account with this email." : data.message || "Something went wrong.");
        return;
      }
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async () => {
    const region = typeof order.region === "object" ? order.region : { name: order.region || "", fee: 0 };
    await dispatch(
      updateUser({
        firstName: order.firstName,
        lastName: order.lastName,
        phone: order.phone,
        addPhone: order.addPhone,
        address: order.address,
        city: order.city,
        region,
      })
    ).catch(() => {});
    toast.success("Account created! This order is now in My orders.");
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="rounded-[24px] bg-mint p-6">
        <p className="text-lg font-bold text-forest">You&apos;re all set</p>
        <p className="mt-1 text-sm text-forest/80">Your details are saved for next time, and you can follow this order in your account.</p>
        <Link href="/profile?tab=My%20Orders" className="mt-4 inline-block text-sm font-semibold text-forest underline underline-offset-4">
          Go to My orders →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-line p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
          <UserPlus size={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-forest">Save your details for next time</h2>
          <p className="mt-1 text-sm text-muted">
            {step === "code" ? (
              <>
                We&apos;ve sent a 6-digit code to <strong className="break-all text-ink">{order.email}</strong>.
              </>
            ) : (
              <>
                Track this order and check out in seconds next time. We&apos;ll use{" "}
                <strong className="break-all text-ink">{order.email}</strong>, no form to fill.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {step === "code" ? (
          <CodeForm email={order.email} requestCode={requestCode} submitLabel="Create my account" onVerified={saveDetails} />
        ) : (
          <>
            <button
              type="button"
              onClick={start}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-8"
            >
              {loading ? "Sending code…" : "Create my account"}
            </button>
            {error && (
              <p role="alert" className="mt-3 text-[13px] font-medium text-red-500">
                {error}{" "}
                {hasAccount && (
                  <Link
                    href={`/login?${new URLSearchParams({ email: order.email, callbackUrl: "/profile?tab=My Orders" })}`}
                    className="font-semibold text-forest underline underline-offset-2"
                  >
                    Sign in to see this order
                  </Link>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
