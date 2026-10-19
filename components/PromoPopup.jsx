"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Check, Copy } from "lucide-react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

const SEEN_KEY = "fil_promo_seen";
const OPEN_DELAY_MS = 5000;
const PROMO_CODE = "WELCOME10";

// Pages where a popup would get in the way of finishing a task
const HIDDEN_PATHS = ["/cart", "/checkout", "/login", "/register", "/verify", "/reset-password", "/review", "/verify-email"];

const COUNTRIES = [
  { code: "NG", dial: "+234", flag: "🇳🇬" },
  { code: "GH", dial: "+233", flag: "🇬🇭" },
  { code: "KE", dial: "+254", flag: "🇰🇪" },
  { code: "ZA", dial: "+27", flag: "🇿🇦" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "US", dial: "+1", flag: "🇺🇸" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TenOff({ className = "" }) {
  return <span className={`${instrumentSerif.className} italic font-normal tracking-[-0.047em] text-ink ${className}`}>10% Off</span>;
}

export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("ask"); // ask → form → done
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const emailRef = useRef(null);

  const hidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (hidden) return;
    let seen = false;
    try {
      seen = !!localStorage.getItem(SEEN_KEY);
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [hidden]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (step === "form") emailRef.current?.focus();
  }, [step]);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch {}
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");

    if (!EMAIL_RE.test(trimmedEmail)) return setError("Please enter a valid email address.");
    if (smsOptIn && !digits) return setError("Add your phone number to receive text offers.");
    if (digits && (digits.length < 7 || digits.length > 14)) return setError("Please enter a valid phone number.");

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: digits ? `${country.dial}${digits}` : undefined,
          smsOptIn: smsOptIn && !!digits,
          source: "promo_popup",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Something went wrong. Try again!");
        return;
      }
      try {
        localStorage.setItem(SEEN_KEY, "true");
      } catch {}
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (hidden) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-roboto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={close} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Get 10% off your first order"
            className="relative grid max-h-[calc(100dvh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:grid-cols-[44%_56%] md:overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Image panel */}
            <div className="relative h-[200px] bg-[#a6ecc8] md:h-auto md:min-h-[460px]">
              <Image
                src="/promotion.png"
                alt="Woman holding a FIL 30,000mAh power bank"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover object-[center_22%] md:object-left-bottom"
              />
            </div>

            {/* Content panel */}
            <div className="relative flex flex-col px-6 pb-7 pt-6 sm:px-9">
              <div className="mb-4 flex items-center justify-between">
                <Image src="/fillogo.png" alt="FIL" width={52} height={22} className="h-auto w-[52px]" />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-sage"
                >
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {step === "ask" && (
                  <motion.div
                    key="ask"
                    className="flex flex-1 flex-col justify-center"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="font-poppins text-forest">
                      <span className="block text-[26px] font-bold leading-none sm:text-[30px]">Want</span>
                      <TenOff className="-mt-1 block text-[84px] leading-none sm:text-[112px]" />
                      <span className="block pl-[22%] text-[22px] font-bold leading-tight sm:text-[26px]">Your First Order?</span>
                    </h2>

                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="mt-8 h-12 w-full rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                      Yes, Please!
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="mx-auto mt-3 text-sm text-ink underline underline-offset-2 hover:text-forest"
                    >
                      No, I&apos;ll pay full price
                    </button>
                  </motion.div>
                )}

                {step === "form" && (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-1 flex-col"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="mb-5 flex items-baseline gap-2 font-poppins">
                      <span className="text-[26px] font-bold text-forest sm:text-[30px]">Claim</span>
                      <TenOff className="text-[60px] leading-none sm:text-[76px]" />
                    </h2>

                    <input
                      ref={emailRef}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      aria-label="Email address"
                      className="h-12 w-full rounded-xl border border-line px-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-forest"
                    />

                    <div className="mt-3 flex gap-2">
                      <label className="relative flex h-12 shrink-0 items-center rounded-xl border border-line pl-3 pr-8 text-sm text-ink focus-within:border-forest">
                        <span aria-hidden>{country.flag}</span>
                        <span className="ml-1.5">{country.dial}</span>
                        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-faint" />
                        <select
                          aria-label="Country code"
                          value={country.code}
                          onChange={(e) => setCountry(COUNTRIES.find((c) => c.code === e.target.value))}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code} {c.dial}
                            </option>
                          ))}
                        </select>
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="813 767 8990"
                        aria-label="Phone number"
                        className="h-12 min-w-0 flex-1 rounded-xl border border-line px-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-forest"
                      />
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-forest"
                      />
                      <span>
                        <span className="block text-[13px] font-semibold text-ink">Receive offers via text message</span>
                        <span className="mt-1 block text-[10.5px] leading-relaxed text-faint">
                          Text me with news and offers! By checking this box you consent to receive texts from FIL,
                          including texts sent by autodialer. Consent is not a condition of purchase. Message &amp; data
                          rates may apply. Message frequency varies. Text STOP to unsubscribe or HELP for help.{" "}
                          <Link href="/policies" className="underline hover:text-forest">Privacy Policy</Link> &amp;{" "}
                          <Link href="/policies" className="underline hover:text-forest">Terms</Link>.
                        </span>
                      </span>
                    </label>

                    {error && (
                      <p role="alert" className="mt-3 text-[13px] font-medium text-filred">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-5 h-12 w-full rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
                    >
                      {loading ? "Submitting…" : "Submit"}
                    </button>
                  </motion.form>
                )}

                {step === "done" && (
                  <motion.div
                    key="done"
                    className="flex flex-1 flex-col justify-center"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-forest">
                      <Check size={24} />
                    </span>
                    <h2 className="mt-4 font-poppins text-[28px] font-bold leading-tight text-forest">You&apos;re in!</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Here&apos;s your <strong className="text-ink">10% off</strong> code. We&apos;ve also sent it to your
                      inbox. Sign in to your FIL account and apply it at checkout.
                    </p>

                    <button
                      type="button"
                      onClick={copyCode}
                      className="mt-5 flex h-14 w-full items-center justify-between rounded-xl border-2 border-dashed border-forest/30 bg-sage px-5 font-mono text-xl font-bold tracking-[0.2em] text-forest transition-colors hover:bg-mint"
                    >
                      {PROMO_CODE}
                      <span className="flex items-center gap-1.5 font-roboto text-xs font-semibold tracking-normal">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={close}
                      className="mt-4 h-12 w-full rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                      Start shopping
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
