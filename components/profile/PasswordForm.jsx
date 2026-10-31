"use client";
// components/profile/PasswordForm.jsx — change password. Popup/signup accounts start with a
// password we emailed them, so we say so; Google-only accounts are pointed at "Forgot password".
import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Info, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { fetchUser } from "@/store/features/authSlice";
import { Field, inputClass } from "@/components/checkout/formFields";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function PasswordForm() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  if (user?.hasPassword === false) {
    return (
      <section className="rounded-[24px] border border-line p-6 sm:p-8">
        <h2 className="text-xl font-bold text-forest">Password</h2>
        <p className="mt-2 text-[15px] text-muted">
          You sign in with Google, so there&apos;s no password on your account. You can also sign in with a 6-digit code we
          email you. Want a password too?
        </p>
        <Link
          href="/reset-password"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black"
        >
          Set a password
        </Link>
      </section>
    );
  }

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.currentPassword) found.currentPassword = "Enter your current password";
    if (values.newPassword.length < 8) found.newPassword = "Use at least 8 characters";
    if (values.confirmPassword !== values.newPassword) found.confirmPassword = "Passwords don't match";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (/current password/i.test(data.message || "")) setErrors({ currentPassword: data.message });
        else toast.error(data.message || "Couldn't change your password. Please try again.");
        return;
      }
      toast.success("Password changed.");
      setValues(EMPTY);
      dispatch(fetchUser());
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const passwordInput = (name, autoComplete) => (
    <input
      id={name}
      name={name}
      type={show ? "text" : "password"}
      autoComplete={autoComplete}
      value={values[name]}
      onChange={onChange}
      aria-invalid={Boolean(errors[name])}
      className={inputClass(errors[name])}
    />
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-[24px] border border-line p-6 sm:p-8">
      <h2 className="text-xl font-bold text-forest">Password</h2>
      <p className="mt-1 text-sm text-muted">You can also sign in any time with a 6-digit code we email you.</p>

      {user?.passwordIsGenerated && (
        <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-mint px-4 py-3 text-sm text-forest">
          <Info size={17} className="mt-0.5 shrink-0" />
          You&apos;re using the password we emailed you when you joined. Pick one you&apos;ll remember.
        </p>
      )}

      <div className="mt-6 grid max-w-lg grid-cols-1 gap-4">
        <Field
          label={user?.passwordIsGenerated ? "Current password (from your welcome email)" : "Current password"}
          htmlFor="currentPassword"
          required
          error={errors.currentPassword}
        >
          {passwordInput("currentPassword", "current-password")}
        </Field>
        <Field label="New password" htmlFor="newPassword" required error={errors.newPassword}>
          {passwordInput("newPassword", "new-password")}
        </Field>
        <Field label="Confirm new password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
          {passwordInput("confirmPassword", "new-password")}
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-forest"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />} {show ? "Hide passwords" : "Show passwords"}
      </button>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={saving}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
        >
          <Lock size={16} /> {saving ? "Saving…" : "Change password"}
        </button>
        <Link href="/reset-password" className="text-center text-sm font-medium text-muted underline-offset-2 hover:text-forest hover:underline">
          Forgot your current password?
        </Link>
      </div>
    </form>
  );
}
