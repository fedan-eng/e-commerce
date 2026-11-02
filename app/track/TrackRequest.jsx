"use client";
// app/track/TrackRequest.jsx — the lookup form and the request's progress (POST /api/returns/track)
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Check, CircleAlert, MessageCircle, Search } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { Field, inputClass } from "@/components/checkout/formFields";
import { formatAmount } from "@/lib/utils";

const WHATSAPP = "https://wa.me/2347018900705";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

function Progress({ request }) {
  const declined = request.status === "rejected";
  const current = request.steps.findIndex((s) => s.key === request.status);
  const reachedAt = (key) => [...request.history].reverse().find((h) => h.status === key)?.date;
  // A declined request stops after "Requested"
  const steps = declined ? [request.steps[0], { key: "rejected", label: "Declined" }] : request.steps;

  return (
    <ol className="mt-6">
      {steps.map((step, i) => {
        const done = declined || i <= current;
        const isNow = declined ? i === steps.length - 1 : i === current;
        const when = reachedAt(step.key);
        const bad = step.key === "rejected";
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span className={`absolute left-[13px] top-7 h-[calc(100%-28px)] w-0.5 ${i < current || declined ? "bg-forest" : "bg-line"}`} aria-hidden />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                bad ? "border-red-600 bg-red-600 text-white" : done ? "border-forest bg-forest text-white" : "border-line bg-white text-muted"
              } ${isNow ? "ring-4 ring-forest/15" : ""}`}
            >
              {bad ? "!" : done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-sm font-semibold ${done ? "text-ink" : "text-muted"}`}>{step.label}</p>
              {when && <p className="text-xs text-muted">{fmtDate(when)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function RequestView({ request, onReset }) {
  const rows = [
    ["Order", request.order],
    ["Requested", fmtDate(request.createdAt)],
    ...(request.type === "refund"
      ? [
          ["Amount", formatAmount(request.amount)],
          ["Refund to", request.refundTo],
          ["Transfer reference", request.refundReference],
        ]
      : [["Deliver back to", request.deliverTo]]),
  ].filter(([, v]) => v);

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_40px_rgba(0,67,40,0.08)] ring-1 ring-line md:p-8">
      <p className="text-sm font-medium text-muted">{request.typeLabel}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-wide text-forest">{request.code}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            request.status === "rejected" ? "bg-red-50 text-red-700" : "bg-mint text-forest"
          }`}
        >
          {request.statusLabel}
        </span>
      </div>
      <p className="mt-3 text-[15px] text-muted">{request.statusMessage}</p>

      {request.customerNote && (
        <div className="mt-5 rounded-[20px] bg-sage p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-forest">Note from our team</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink">{request.customerNote}</p>
        </div>
      )}

      <Progress request={request} />

      <div className="mt-8 flex items-center gap-3 rounded-[20px] bg-sage p-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white">
          <ProductImage src={request.item.image} alt={request.item.name} width={52} height={52} className="h-[52px] w-[52px] object-contain" />
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{request.item.name}</p>
          <p className="text-xs text-muted">
            {request.item.color ? `${request.item.color} · ` : ""}Qty {request.quantity}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted">{label}</dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <button type="button" onClick={onReset} className="text-sm font-semibold text-forest underline underline-offset-4">
          Track another request
        </button>
        <a
          href={`${WHATSAPP}?text=${encodeURIComponent(`Hi FIL, I'm asking about ${request.code}`)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-sage"
        >
          <MessageCircle size={16} /> Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function TrackRequest() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [contact, setContact] = useState("");
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/returns/track", payload);
      setRequest(res.data.request);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Email links: ?code=…&key=… opens the request straight away
  useEffect(() => {
    const key = params.get("key");
    if (params.get("code") && key) lookup({ code: params.get("code"), key });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (request) return <RequestView request={request} onReset={() => { setRequest(null); setContact(""); }} />;

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_40px_rgba(0,67,40,0.08)] ring-1 ring-line md:p-8">
      <h1 className="text-2xl font-bold text-forest">Track a refund or return</h1>
      <p className="mt-2 text-[15px] text-muted">
        Enter the request ID we sent you (it starts with RF for refunds or RT for returns) and the email or phone number on your order.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup({ code, contact });
        }}
        className="mt-6 flex flex-col gap-4"
      >
        <Field label="Request ID" htmlFor="code" required>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. RT-7K3F9Q"
            autoCapitalize="characters"
            autoComplete="off"
            required
            className={`${inputClass(false)} tracking-wide`}
          />
        </Field>
        <Field label="Email or phone number" htmlFor="contact" required>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="The one you ordered with"
            autoComplete="email"
            required
            className={inputClass(false)}
          />
        </Field>

        {error && (
          <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <CircleAlert size={17} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
        >
          <Search size={17} /> {loading ? "Checking…" : "Check status"}
        </button>
      </form>
    </div>
  );
}
