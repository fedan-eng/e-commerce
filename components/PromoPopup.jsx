"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Mail } from "lucide-react";
import toast from "react-hot-toast";
import CodeForm from "@/components/auth/CodeForm";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

const SEEN_KEY = "fil_promo_seen";
const OPEN_DELAY_MS = 5000;

// Pages where a popup would get in the way of finishing a task
const HIDDEN_PATHS = ["/cart", "/checkout", "/login", "/register", "/reset-password", "/review", "/verify-email"];

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
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("ask"); // ask → form → code
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const emailRef = useRef(null);

  // Signed-in shoppers already have an account, so there's nothing to sign up for
  const hidden = isAuthenticated || HIDDEN_PATHS.some((p) => pathname.startsWith(p));

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

  // Creates the account and emails the code; also used by "Resend code"
  const requestCode = async () => {
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        phone: digits ? `${country.dial}${digits}` : undefined,
        smsOptIn: smsOptIn && !!digits,
        source: "promo_popup",
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setHasAccount(false);
    const trimmedEmail = email.trim();
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");

    if (!EMAIL_RE.test(trimmedEmail)) return setError("Please enter a valid email address.");
    if (smsOptIn && !digits) return setError("Add your phone number to receive text offers.");
    if (digits && (digits.length < 7 || digits.length > 14)) return setError("Please enter a valid phone number.");

    setLoading(true);
    try {
      const { ok, data } = await requestCode();
      if (!ok) {
        setHasAccount(Boolean(data.hasAccount));
        setError(data.message || "Something went wrong. Try again!");
        return;
      }
      try {
        localStorage.setItem(SEEN_KEY, "true");
      } catch {}
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (hidden) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 font-roboto sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={close} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Get 10% off your first order"
            className={`relative grid max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto ${
              step === "ask" ? "max-w-[760px] grid-cols-[38%_62%]" : "max-w-[420px] grid-cols-1"
            } rounded-[20px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px] md:max-w-[760px] md:grid-cols-[44%_56%] md:overflow-hidden`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Image panel: on phones only the first step has room for it beside the text */}
            <div className={`relative bg-[#a6ecc8] md:block md:min-h-[460px] ${step === "ask" ? "" : "hidden"}`}>
              <Image
                src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/promotion.png"
                alt="Woman holding a FIL 30,000mAh power bank"
                fill
                priority
                sizes="(max-width: 768px) 40vw, 340px"
                className="object-cover object-bottom md:object-left-bottom"
              />
            </div>

            {/* Content panel */}
            <div className="relative flex min-w-0 flex-col px-4 pb-5 pt-4 sm:px-9 sm:pb-7 sm:pt-6">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <Image src="/fillogo.png" alt="FIL" width={52} height={22} className="h-auto w-[42px] sm:w-[52px]" />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-sage"
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
                      <span className="block text-[18px] font-bold leading-none sm:text-[24px] md:text-[30px]">Want</span>
                      <TenOff className="-mt-1 block text-[50px] leading-none sm:text-[80px] md:text-[112px]" />
                      <span className="block pl-[18%] text-[14px] font-bold leading-tight sm:pl-[22%] sm:text-[20px] md:text-[26px]">Your First Order?</span>
                    </h2>

                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="mt-5 h-10 w-full rounded-full bg-forest text-[13px] font-semibold sm:mt-8 sm:h-12 sm:text-sm text-white transition-colors hover:bg-black"
                    >
                      Yes, Please!
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="mx-auto mt-2.5 text-xs text-ink underline sm:mt-3 sm:text-sm underline-offset-2 hover:text-forest"
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
                    <h2 className="mb-3 flex items-baseline gap-1.5 font-poppins sm:mb-5 sm:gap-2">
                      <span className="text-[24px] font-bold text-forest sm:text-[26px] md:text-[30px]">Claim</span>
                      <TenOff className="text-[56px] leading-none sm:text-[60px] md:text-[76px]" />
                    </h2>

                    <input
                      ref={emailRef}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      aria-label="Email address"
                      className="h-10 w-full rounded-xl border border-line px-3 text-sm sm:h-12 sm:px-4 text-ink outline-none transition-colors placeholder:text-faint focus:border-forest"
                    />

                    <div className="mt-2 flex gap-1.5 sm:mt-3 sm:gap-2">
                      <label className="relative flex h-10 shrink-0 items-center rounded-xl border border-line pl-2 pr-6 text-[13px] sm:h-12 sm:pl-3 sm:pr-8 sm:text-sm text-ink focus-within:border-forest">
                        <span aria-hidden>{country.flag}</span>
                        <span className="ml-1 sm:ml-1.5">{country.dial}</span>
                        <ChevronDown size={14} className="pointer-events-none absolute right-1.5 text-faint sm:right-2.5" />
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
                        className="h-10 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm sm:h-12 sm:px-4 text-ink outline-none transition-colors placeholder:text-faint focus:border-forest"
                      />
                    </div>

                    <label className="mt-3 flex cursor-pointer items-start gap-2 sm:mt-4 sm:gap-2.5">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-forest"
                      />
                      <span>
                        <span className="block text-[12px] font-semibold leading-snug text-ink sm:text-[13px]">Receive offers via text message</span>
                        <span className="mt-1 block text-[9.5px] leading-snug text-faint sm:text-[10.5px] sm:leading-relaxed">
                          Text me with news and offers! By checking this box you consent to receive texts from FIL,
                          including texts sent by autodialer. Consent is not a condition of purchase. Message &amp; data
                          rates may apply. Message frequency varies. Text STOP to unsubscribe or HELP for help.{" "}
                          <Link href="/policies" className="underline hover:text-forest">Privacy Policy</Link> &amp;{" "}
                          <Link href="/policies" className="underline hover:text-forest">Terms</Link>.
                        </span>
                      </span>
                    </label>

                    {error && (
                      <p role="alert" className="mt-3 text-[12px] font-medium text-filred sm:text-[13px]">
                        {error}{" "}
                        {hasAccount && (
                          <Link href="/login" onClick={close} className="font-semibold text-forest underline underline-offset-2">
                            Sign in
                          </Link>
                        )}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-4 h-10 w-full rounded-full bg-forest text-[13px] font-semibold text-white transition-colors hover:bg-black sm:mt-5 sm:h-12 sm:text-sm disabled:cursor-wait disabled:opacity-70"
                    >
                      {loading ? "Submitting…" : "Submit"}
                    </button>
                  </motion.form>
                )}

                {step === "code" && (
                  <motion.div
                    key="code"
                    className="flex flex-1 flex-col justify-center"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-forest sm:h-12 sm:w-12">
                      <Mail size={20} />
                    </span>
                    <h2 className="mt-3 font-poppins text-[20px] font-bold leading-tight text-forest sm:mt-4 sm:text-[28px]">Check your inbox!</h2>
                    <p className="mb-4 mt-2 text-[12px] leading-relaxed text-muted sm:mb-5 sm:text-sm">
                      We&apos;ve created your FIL account and sent a 6-digit code to{" "}
                      <strong className="break-all text-ink">{email.trim()}</strong>. Enter it to get your{" "}
                      <strong className="text-ink">10% off</strong> code.
                    </p>
                    <CodeForm
                      email={email.trim()}
                      requestCode={requestCode}
                      submitLabel="Verify & sign in"
                      onChangeEmail={() => {
                        setError("");
                        setStep("form");
                      }}
                      onVerified={() => {
                        setOpen(false);
                        toast.success("You're signed in! Your WELCOME10 code is on its way to your inbox.", { duration: 6000 });
                      }}
                    />
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
