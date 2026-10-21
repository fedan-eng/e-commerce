"use client";
// components/auth/LoginForm.jsx — sign in with a password, a 6-digit email code
// (/api/auth/login-code → /api/auth/verify-code) or Google.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Eye, EyeOff, Mail } from "lucide-react";
import { inputClass } from "@/components/checkout/formFields";
import { useCompleteSignIn } from "@/hooks/useCompleteSignIn";
import AuthShell, { GoogleButton, OrDivider, safeCallback } from "./AuthShell";
import CodeForm from "./CodeForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ?error= values from the Google callback and the email verify link
const URL_ERRORS = {
  email_exists: "An account with this email already exists. Sign in with your password or an email code.",
  already_verified: "Your email is already verified. Sign in below.",
  invalid_token: "That link has expired or was already used. Sign in with an email code instead.",
  token_mismatch: "That link has expired or was already used. Sign in with an email code instead.",
  token_expired: "That link has expired. Sign in with an email code instead.",
  missing_token: "That link didn't work. Sign in with an email code instead.",
  user_not_found: "That link didn't work. Sign in with an email code instead.",
};
const GOOGLE_FAILED = "Google sign-in didn't finish. Please try again.";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = safeCallback(searchParams);
  const completeSignIn = useCompleteSignIn();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [mode, setMode] = useState("password"); // password | code-email | code
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() => {
    const key = searchParams.get("error");
    return key ? URL_ERRORS[key] || GOOGLE_FAILED : "";
  });
  const [hint, setHint] = useState(null); // "google" | "no-account" | null
  const [notice, setNotice] = useState(""); // shown above the code form
  const [loading, setLoading] = useState(false);

  const destinationFor = (u) => (u?.role === "admin" ? "/admin_console" : callback);

  // Already signed in (e.g. a cached page)
  useEffect(() => {
    if (isAuthenticated && user && mode !== "code") router.replace(destinationFor(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const reset = () => {
    setError("");
    setHint(null);
  };

  const requestCode = async () => {
    const res = await fetch("/api/auth/login-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  };

  // Sends a code and moves to the code step
  const sendCode = async (message = "") => {
    reset();
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    setLoading(true);
    try {
      const { ok, data } = await requestCode();
      if (!ok) {
        if (data.noAccount) setHint("no-account");
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setNotice(message);
      setMode("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    reset();
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const signedIn = await completeSignIn();
        router.replace(destinationFor(signedIn || data.user));
        return;
      }
      if (data.requiresVerification) {
        setLoading(false);
        return sendCode("You haven't verified your email yet. Enter the code we just sent to finish.");
      }
      if (data.provider === "google") setHint("google");
      else if (res.status === 404) setHint("no-account");
      setError(
        data.provider === "google"
          ? "This account uses Google sign-in."
          : res.status === 404
            ? "We couldn't find an account with that email."
            : res.status === 401
              ? "That password isn't right."
              : data.message || "Something went wrong. Please try again."
      );
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const signupHref = `/register?${new URLSearchParams({
    ...(email.trim() ? { email: email.trim() } : {}),
    ...(callback !== "/" ? { callbackUrl: callback } : {}),
  })}`;

  const errorBlock = error && (
    <p role="alert" className="mt-3 text-[13px] font-medium text-red-500">
      {error}{" "}
      {hint === "no-account" && (
        <Link href={signupHref} className="font-semibold text-forest underline underline-offset-2">
          Create an account
        </Link>
      )}
      {hint === "google" && <span className="text-muted">Use the Google button above, or sign in with an email code.</span>}
    </p>
  );

  // ── Code step ──
  if (mode === "code") {
    return (
      <AuthShell
        eyebrow="Sign in"
        title="Check your inbox"
        subtitle={
          notice ? (
            <>
              {notice} It went to <strong className="break-all text-ink">{email.trim()}</strong>.
            </>
          ) : (
            <>
              We&apos;ve sent a 6-digit code to <strong className="break-all text-ink">{email.trim()}</strong>.
            </>
          )
        }
      >
        <CodeForm
          email={email.trim()}
          requestCode={requestCode}
          submitLabel="Sign in"
          onChangeEmail={() => {
            reset();
            setMode("code-email");
          }}
          onVerified={({ user: signedIn }) => router.replace(destinationFor(signedIn))}
        />
      </AuthShell>
    );
  }

  const footer = (
    <>
      New to FIL?{" "}
      <Link href={signupHref} className="font-semibold text-forest underline underline-offset-2">
        Create an account
      </Link>{" "}
      and get 10% off your first order.
    </>
  );

  // ── Email-only (code) ──
  if (mode === "code-email") {
    return (
      <AuthShell eyebrow="Sign in" title="Sign in with a code" subtitle="We'll email you a 6-digit code. No password needed." footer={footer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
          noValidate
        >
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass(error)}
          />
          {errorBlock}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
          >
            <Mail size={17} /> {loading ? "Sending…" : "Email me a code"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setMode("password");
            }}
            className="mx-auto mt-4 block text-sm font-semibold text-forest underline underline-offset-2"
          >
            Use my password instead
          </button>
        </form>
      </AuthShell>
    );
  }

  // ── Password ──
  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to FIL" subtitle="Track your orders and check out faster." footer={footer}>
      <GoogleButton callbackUrl={callback} highlight={hint === "google"} />
      <OrDivider />

      <form onSubmit={handlePasswordLogin} noValidate>
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
          className={inputClass(false)}
        />

        <div className="mb-1.5 mt-4 flex items-baseline justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-forest">
            Password
          </label>
          <Link href="/reset-password" className="text-[13px] font-medium text-muted underline-offset-2 hover:text-forest hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={`${inputClass(false)} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-white hover:text-forest"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errorBlock}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          reset();
          setMode("code-email");
        }}
        className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-line text-[15px] font-semibold text-forest transition-colors hover:border-forest hover:bg-sage"
      >
        <Mail size={17} /> Email me a sign-in code
      </button>
    </AuthShell>
  );
}
