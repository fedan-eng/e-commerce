"use client";
// components/VerifyEmailContent.jsx — where the "Verify my email" link lands. The API verifies
// the token, signs the shopper in and redirects; we then load that page fresh.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const callback = searchParams.get("callback");
    if (!token) {
      setError("This link is missing its verification code.");
      return;
    }

    const apiUrl = `/api/auth/verify-email?token=${encodeURIComponent(token)}${
      callback ? `&callback=${encodeURIComponent(callback)}` : ""
    }`;

    fetch(apiUrl)
      .then((response) => {
        if (response.redirected) {
          // On success the API has just signed them in, so load the page fresh to pick up the session
          const redirectUrl = new URL(response.url);
          window.location.replace(redirectUrl.pathname + redirectUrl.search);
          return;
        }
        setError("We couldn't verify your email. Please try again.");
      })
      .catch(() => setError("Something went wrong. Please try again."));
  }, [searchParams]);

  if (error) {
    return (
      <AuthShell eyebrow="Verify email" title="That didn't work" subtitle={error}>
        <Link
          href="/login"
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black"
        >
          Sign in with an email code
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Verify email" title="Verifying your email…" subtitle="Hang on a second, we're signing you in.">
      <div className="flex justify-center py-6 text-forest">
        <Loader2 size={32} className="animate-spin" />
      </div>
    </AuthShell>
  );
};

export default VerifyEmailContent;
