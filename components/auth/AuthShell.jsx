"use client";
// components/auth/AuthShell.jsx — layout for sign-in, signup and email verification:
// a photo panel beside the form on desktop, just the form on mobile. The site navbar and
// footer are hidden on these pages (see Navbar/Footer staticPaths).
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgePercent, PackageCheck, Zap } from "lucide-react";
import { useSelector } from "react-redux";

const PERKS = [
  { icon: BadgePercent, text: "10% off your first order" },
  { icon: PackageCheck, text: "Track every order in one place" },
  { icon: Zap, text: "Faster checkout with saved details" },
];

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <main className="min-h-dvh bg-white font-roboto lg:grid lg:grid-cols-2">
      {/* ── Photo panel (desktop) ── */}
      <aside className="relative hidden overflow-hidden bg-forest lg:block">
        <Image
          src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/promotion.png"
          alt="Woman holding a FIL 30,000mAh power bank"
          fill
          priority
          sizes="50vw"
          className="object-cover object-[center_22%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-[34px] font-bold leading-tight text-white xl:text-[40px]">
            Think Quality,
            <br />
            Think FIL.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] font-medium text-mint">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Form ── */}
      <section className="flex min-h-dvh flex-col px-4 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <Link href="/" aria-label="FIL home">
            <Image src="/fillogo.png" alt="FIL" width={56} height={24} className="h-auto w-[56px]" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-forest transition-colors hover:bg-sage"
          >
            <ArrowLeft size={16} /> Back to shop
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8">
          {eyebrow && (
            <span className="w-fit rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-[30px] font-bold leading-tight tracking-tight text-forest md:text-[34px]">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>

        <p className="pb-6 text-center text-xs text-faint">
          By continuing you agree to our{" "}
          <Link href="/policies" className="font-medium text-forest underline underline-offset-2">
            Terms and Privacy Policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

// "Continue with Google" — keeps the visitor's cart across the Google redirect
export function GoogleButton({ callbackUrl = "/", label = "Continue with Google", highlight = false }) {
  const cartItems = useSelector((s) => s.cart.items);

  const go = () => {
    if (cartItems.length > 0) {
      document.cookie = `visitor_cart=${encodeURIComponent(JSON.stringify(cartItems))}; path=/; max-age=300; SameSite=Lax`;
    }
    window.location.href = `/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <button
      type="button"
      onClick={go}
      className={`flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full border text-[15px] font-semibold text-ink transition-colors ${
        highlight ? "border-forest bg-mint" : "border-line bg-white hover:border-forest hover:bg-sage"
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-medium uppercase tracking-wider text-faint">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

// Same-site path from ?callbackUrl= / ?callback=, or the fallback
export function safeCallback(searchParams, fallback = "/") {
  const raw = searchParams.get("callbackUrl") || searchParams.get("callback");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}
