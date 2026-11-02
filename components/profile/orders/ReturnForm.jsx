"use client";
// components/profile/orders/ReturnForm.jsx — a refund or return request for one item (POST /api/returns).
// Refunds ask for the bank account; returns ask for the item's condition and show where it comes back to.
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { ProductImage } from "@/components/ProductImage";
import { Field, inputClass } from "@/components/checkout/formFields";
import { formatAmount } from "@/lib/utils";

const EMPTY = { quantity: "", reason: "", condition: "", bankName: "", accountNumber: "", accountName: "" };

const COPY = {
  refund: {
    title: "Request a refund",
    intro: "Tell us what happened and where to send your money.",
    reason: "Reason for the refund",
    submit: "Send refund request",
  },
  return: {
    title: "Return an item",
    intro: "Send the item in and we'll sort it out, then deliver it back to you.",
    reason: "What's wrong with it?",
    submit: "Send return request",
  },
};

export default function ReturnForm({ type = "return", order, item, itemIndex, onBack, onSent }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [sentCode, setSentCode] = useState("");
  const maxQty = Number(item.quantity) || 1;
  const copy = COPY[type];
  const regionName = order.region?.name || order.region || "";

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post("/api/returns", { ...form, type, orderId: order._id, itemIndex });
      setSentCode(res.data.code);
      onSent?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const input = (name, props = {}) => (
    <input id={name} name={name} value={form[name]} onChange={onChange} required className={inputClass(false)} {...props} />
  );

  return (
    <section className="rounded-[24px] border border-line p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-forest">
        <ArrowLeft size={16} /> Back to order
      </button>
      <h2 className="mt-4 text-xl font-bold text-forest">{copy.title}</h2>
      <p className="mt-1 text-sm text-muted">{copy.intro}</p>

      <div className="mt-6 flex items-center gap-3 rounded-[20px] bg-sage p-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white">
          <ProductImage src={item.image} alt={item.name} width={52} height={52} className="h-[52px] w-[52px] object-contain" />
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
          <p className="text-xs text-muted">
            Qty {item.quantity} · {formatAmount(item.price)}
          </p>
        </div>
      </div>

      {sentCode ? (
        <div className="mt-6 rounded-[20px] bg-mint p-5">
          <p className="font-bold text-forest">Request sent</p>
          <p className="mt-1 text-sm text-forest/80">
            Your request ID is <span className="font-bold tracking-wide text-forest">{sentCode}</span>. We&apos;ve emailed it
            to you too. Use it to check on your {type} any time.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href={`/track?code=${sentCode}`} className="text-sm font-semibold text-forest underline underline-offset-4">
              Track it
            </Link>
            <button type="button" onClick={onBack} className="text-sm font-semibold text-forest underline underline-offset-4">
              Back to order
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {type === "return" && (
              <Field label="Condition of the item" htmlFor="condition" required>
                {input("condition", { placeholder: "e.g. Faulty, damaged, not charging" })}
              </Field>
            )}
            <Field label={`Quantity (max ${maxQty})`} htmlFor="quantity" required>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                max={maxQty}
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value === "" ? "" : Math.min(Number(e.target.value), maxQty) }))
                }
                className={inputClass(false)}
              />
            </Field>
            <Field label={copy.reason} htmlFor="reason" required className="sm:col-span-2">
              <textarea
                id="reason"
                name="reason"
                rows={4}
                required
                value={form.reason}
                onChange={onChange}
                className={`${inputClass(false)} resize-none`}
              />
            </Field>
          </div>

          {type === "refund" ? (
            <>
              <h3 className="mt-8 font-bold text-forest">Refund details</h3>
              <p className="mt-1 text-sm text-muted">The account we&apos;ll send your refund to once it&apos;s approved.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Bank name" htmlFor="bankName" required>
                  {input("bankName")}
                </Field>
                <Field label="Account number" htmlFor="accountNumber" required>
                  {input("accountNumber", { inputMode: "numeric", maxLength: 10, pattern: "\\d{10}", title: "10-digit account number" })}
                </Field>
                <Field label="Account name" htmlFor="accountName" required className="sm:col-span-2">
                  {input("accountName")}
                </Field>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[20px] border border-line p-5">
              <h3 className="font-bold text-forest">We&apos;ll deliver it back to</h3>
              <p className="mt-2 text-sm text-muted">
                {[order.address, order.city, regionName].filter(Boolean).join(", ")}
              </p>
              <p className="mt-2 text-xs text-muted">Moved? Mention your new address in the box above.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onBack}
              className="h-12 rounded-full px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-sage"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
            >
              {submitting ? "Sending…" : copy.submit}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
