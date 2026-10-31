"use client";
// components/auth/SignupForm.jsx — email-only signup, the same flow as the promo popup:
// email → we create the account (generated password) and email a 6-digit code → code → signed in.
// Name, phone and address are collected afterwards by the profile prompt or at checkout.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { inputClass } from "@/components/checkout/formFields";
import AuthShell, { GoogleButton, OrDivider, safeCallback } from "./AuthShell";
import CodeForm from "./CodeForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = safeCallback(searchParams);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [step, setStep] = useState("email"); // email → code
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [newsletter, setNewsletter] = useState(false); // opt-in, never pre-ticked
  const [error, setError] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already signed in (e.g. a cached page): nothing to do here
  useEffect(() => {
    if (isAuthenticated && step === "email") router.replace(callback);
  }, [isAuthenticated, step, router, callback]);

  const requestCode = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), newsletter, callback }),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setHasAccount(false);
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");

    setLoading(true);
    try {
      const { ok, data } = await requestCode();
      if (!ok) {
        setHasAccount(Boolean(data.hasAccount));
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "code") {
    return (
      <AuthShell
        eyebrow="Almost there"
        title="Check your inbox"
        subtitle={
          <>
            We&apos;ve created your account and sent a 6-digit code to{" "}
            <strong className="break-all text-ink">{email.trim()}</strong>. The email also has your password, which you
            can change any time.
          </>
        }
      >
        <CodeForm
          email={email.trim()}
          requestCode={requestCode}
          submitLabel="Verify & sign in"
          onChangeEmail={() => setStep("email")}
          onVerified={() => {
            toast.success("Welcome to FIL! Your 10% off code is on its way to your inbox.", { duration: 6000 });
            router.replace(callback);
          }}
        />
      </AuthShell>
    );
  }

  const loginHref = `/login?${new URLSearchParams({
    ...(email.trim() ? { email: email.trim() } : {}),
    ...(callback !== "/" ? { callbackUrl: callback } : {}),
  })}`;

  return (
    <AuthShell
      eyebrow="Join FIL"
      title="Create your account"
      subtitle="Just your email. You'll get 10% off your first order."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-forest underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton callbackUrl={callback} label="Sign up with Google" />
      <OrDivider />

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={Boolean(error)}
          className={inputClass(error)}
        />

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-forest"
          />
          Email me new gadgets, restocks and deals. Unsubscribe any time.
        </label>

        {error && (
          <p role="alert" className="mt-3 text-[13px] font-medium text-red-500">
            {error}{" "}
            {hasAccount && (
              <Link href={loginHref} className="font-semibold text-forest underline underline-offset-2">
                Sign in
              </Link>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Sending your code…" : "Continue"}
        </button>
      </form>
    </AuthShell>
  );
}
