"use client";
// components/auth/ResetPasswordForm.jsx — forgotten password, in the sign-in look (AuthShell).
// ResetPasswordForm: email → 6-digit code + new password (/api/auth/reset-password POST, PUT).
// TokenResetForm: the link from the same email → new password (GET to check it, PATCH to save).
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { Field, inputClass } from "@/components/checkout/formFields";
import AuthShell from "./AuthShell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8; // same rule as changing it on the profile page

const primaryBtn =
  "mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70";
const textBtn = "mx-auto mt-4 block text-sm font-semibold text-forest underline underline-offset-2";

const footer = (
  <>
    Remembered it?{" "}
    <Link href="/login" className="font-semibold text-forest underline underline-offset-2">
      Back to sign in
    </Link>
  </>
);

function ErrorText({ children }) {
  return children ? (
    <p role="alert" className="mt-3 text-[13px] font-medium text-red-500">
      {children}
    </p>
  ) : null;
}

// Returns { newPassword?, confirmPassword? } messages, empty when fine
function checkPasswords({ newPassword, confirmPassword }) {
  const found = {};
  if (newPassword.length < MIN_PASSWORD) found.newPassword = `Use at least ${MIN_PASSWORD} characters`;
  if (confirmPassword !== newPassword) found.confirmPassword = "Passwords don't match";
  return found;
}

function NewPasswordFields({ values, errors, onChange }) {
  const [show, setShow] = useState(false);
  const input = (name, placeholder) => (
    <input
      id={name}
      name={name}
      type={show ? "text" : "password"}
      autoComplete="new-password"
      value={values[name]}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={Boolean(errors[name])}
      className={inputClass(errors[name])}
    />
  );
  return (
    <>
      <Field label="New password" htmlFor="newPassword" error={errors.newPassword} className="mt-4">
        {input("newPassword", `At least ${MIN_PASSWORD} characters`)}
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword} className="mt-4">
        {input("confirmPassword", "Type it again")}
      </Field>
      <button type="button" onClick={() => setShow((s) => !s)} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-forest">
        {show ? <EyeOff size={16} /> : <Eye size={16} />} {show ? "Hide passwords" : "Show passwords"}
      </button>
    </>
  );
}

function usePasswordValues(extra = {}) {
  const [values, setValues] = useState({ newPassword: "", confirmPassword: "", ...extra });
  const [errors, setErrors] = useState({});
  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };
  return { values, errors, setErrors, onChange };
}

// Back to sign in with their email filled in
function useDone() {
  const router = useRouter();
  return (email) => {
    toast.success("Password changed. Sign in with your new password.");
    router.replace(email ? `/login?email=${encodeURIComponent(email)}` : "/login");
  };
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const done = useDone();
  const [step, setStep] = useState("email"); // email | code
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const form = usePasswordValues({ resetCode: "" });

  const sendCode = async (e) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 404 ? "We couldn't find an account with that email." : data.message || "Couldn't send the code. Please try again.");
        return;
      }
      if (step === "code") toast.success("New code sent.");
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const found = checkPasswords(form.values);
    if (!/^\d{6}$/.test(form.values.resetCode.trim())) found.resetCode = "Enter the 6-digit code from the email";
    form.setErrors(found);
    if (Object.keys(found).length) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetCode: form.values.resetCode.trim(),
          newPassword: form.values.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (/code/i.test(data.message || "")) form.setErrors({ resetCode: "That code is wrong or has expired. Send a new one below." });
        else setError(data.message || "Couldn't change your password. Please try again.");
        return;
      }
      done(email.trim().toLowerCase());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "code") {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="Check your inbox"
        subtitle={
          <>
            We&apos;ve sent a 6-digit code to <strong className="break-all text-ink">{email.trim()}</strong>. It works for 10 minutes. The
            email also has a link you can tap instead.
          </>
        }
        footer={footer}
      >
        <form onSubmit={save} noValidate>
          <Field label="6-digit code" htmlFor="resetCode" error={form.errors.resetCode}>
            <input
              id="resetCode"
              name="resetCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              value={form.values.resetCode}
              onChange={(e) => form.onChange({ target: { name: "resetCode", value: e.target.value.replace(/\D/g, "") } })}
              placeholder="123456"
              className={`${inputClass(form.errors.resetCode)} tracking-[0.3em]`}
            />
          </Field>
          <NewPasswordFields values={form.values} errors={form.errors} onChange={form.onChange} />
          <ErrorText>{error}</ErrorText>
          <button type="submit" disabled={loading} className={primaryBtn}>
            <KeyRound size={17} /> {loading ? "Saving…" : "Save new password"}
          </button>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
            <button type="button" onClick={() => sendCode()} disabled={loading} className="text-sm font-semibold text-forest underline underline-offset-2">
              Send a new code
            </button>
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("email");
              }}
              className="text-sm font-semibold text-forest underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a code to set a new one."
      footer={footer}
    >
      <form onSubmit={sendCode} noValidate>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="you@example.com"
          className={inputClass(error)}
        />
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={loading} className={primaryBtn}>
          <Mail size={17} /> {loading ? "Sending…" : "Email me a code"}
        </button>
        <Link href="/login" className={`${textBtn} w-fit`}>
          Sign in with an email code instead
        </Link>
      </form>
    </AuthShell>
  );
}

export function TokenResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const done = useDone();
  const [status, setStatus] = useState("checking"); // checking | ready | invalid
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const form = usePasswordValues();

  useEffect(() => {
    if (!token) return setStatus("invalid");
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.valid) {
          setEmail(data.email || "");
          setStatus("ready");
        } else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const save = async (e) => {
    e.preventDefault();
    const found = checkPasswords(form.values);
    form.setErrors(found);
    if (Object.keys(found).length) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.values.newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (/token|expired/i.test(data.message || "")) setStatus("invalid");
        else setError(data.message || "Couldn't change your password. Please try again.");
        return;
      }
      done(email);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "checking") {
    return (
      <AuthShell eyebrow="Reset password" title="Checking your link…" subtitle="This only takes a moment." footer={footer}>
        <div className="h-[52px] w-full animate-pulse rounded-full bg-sage" />
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="This link has expired"
        subtitle="Reset links work for 10 minutes and only once. Ask for a new one and we'll email it straight away."
        footer={footer}
      >
        <Link href="/reset-password" className={primaryBtn.replace("mt-6 ", "")}>
          <Mail size={17} /> Send me a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle={
        email ? (
          <>
            For <strong className="break-all text-ink">{email}</strong>.
          </>
        ) : (
          "Pick something you'll remember."
        )
      }
      footer={footer}
    >
      <form onSubmit={save} noValidate>
        <NewPasswordFields values={form.values} errors={form.errors} onChange={form.onChange} />
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={loading} className={primaryBtn}>
          <KeyRound size={17} /> {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthShell>
  );
}
