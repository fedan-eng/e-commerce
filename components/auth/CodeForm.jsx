"use client";
// components/auth/CodeForm.jsx — "enter the 6-digit code we emailed you". Used by the promo popup,
// signup, sign-in by code and the order confirmation. A right code signs the shopper in
// (/api/auth/verify-code), keeps their cart and loads the account, then calls onVerified.
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCompleteSignIn } from "@/hooks/useCompleteSignIn";

// requestCode: async () => ({ ok, data }) — sends a new code (for "resend")
export default function CodeForm({ email, requestCode, onVerified, onChangeEmail, submitLabel = "Verify & continue" }) {
  const completeSignIn = useCompleteSignIn();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from your email.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const user = await completeSignIn();
      onVerified?.({ ...data, user });
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setResending(true);
    try {
      const { ok, data } = await requestCode();
      if (ok) {
        setCode("");
        toast.success("New code sent. Check your email.");
      } else {
        setError(data.message || "Couldn't send a new code. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={verify} noValidate>
      <label htmlFor="email-code" className="mb-1.5 block text-sm font-semibold text-forest">
        6-digit code
      </label>
      <input
        ref={inputRef}
        id="email-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
          setError("");
        }}
        placeholder="000000"
        aria-invalid={Boolean(error)}
        className={`h-14 w-full rounded-2xl border bg-sage px-4 text-center font-mono text-2xl tracking-[0.5em] text-forest outline-none transition-colors placeholder:text-muted/40 focus:border-forest focus:bg-white ${
          error ? "border-red-400" : "border-transparent"
        }`}
      />

      {error && (
        <p role="alert" className="mt-2 text-[13px] font-medium text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex h-[52px] w-full items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Checking…" : submitLabel}
      </button>

      <p className="mt-4 text-center text-[13px] text-muted">
        Didn&apos;t get it? Check spam, or{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="font-semibold text-forest underline underline-offset-2 disabled:opacity-60"
        >
          {resending ? "sending…" : "resend the code"}
        </button>
        {onChangeEmail && (
          <>
            {" · "}
            <button type="button" onClick={onChangeEmail} className="font-semibold text-forest underline underline-offset-2">
              change email
            </button>
          </>
        )}
      </p>
    </form>
  );
}
