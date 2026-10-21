"use client";
// components/profile/orders/SupportForm.jsx — message support about an order (POST /api/contact,
// with the order id and optional attachments).
import { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, Paperclip } from "lucide-react";
import { Field, inputClass } from "@/components/checkout/formFields";

const INQUIRY_TYPES = [
  { value: "general", label: "A question", prompt: "Your question", placeholder: "How can we help?" },
  { value: "redress", label: "A problem", prompt: "What went wrong?", placeholder: "Tell us what happened and what you'd like us to do…" },
  { value: "suggestion", label: "A suggestion", prompt: "Your suggestion", placeholder: "We'd love to hear your thoughts…" },
];

export default function SupportForm({ order, onBack }) {
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState({
    inquiryType: "general",
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || order.firstName || "",
    email: user?.email || order.email || "",
    question: "",
    reason: "",
    productName: order.items?.[0]?.name || "",
  });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }

  const type = INQUIRY_TYPES.find((t) => t.value === form.inquiryType);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));
    payload.append("orderId", order._id);
    files.forEach((f) => payload.append("files", f));

    try {
      const res = await fetch("/api/contact", { method: "POST", body: payload });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json().catch(() => ({}));
      setResult({ ok: true, message: data.message || "Message sent. We'll reply by email." });
      setForm((f) => ({ ...f, question: "" }));
      setFiles([]);
    } catch {
      setResult({ ok: false, message: "We couldn't send your message. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-[24px] border border-line p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-forest">
        <ArrowLeft size={16} /> Back to order
      </button>
      <h2 className="mt-4 text-xl font-bold text-forest">Contact support</h2>
      <p className="mt-1 text-sm text-muted">
        About order <span className="font-semibold text-ink">#{String(order._id).slice(-8).toUpperCase()}</span>. A real
        person will reply by email.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <p className="mb-2 text-sm font-semibold text-forest">What&apos;s this about?</p>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, inquiryType: t.value }))}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                form.inquiryType === t.value ? "bg-forest text-white" : "bg-sage text-forest hover:bg-mint"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <input id="name" name="name" required value={form.name} onChange={onChange} className={inputClass(false)} />
          </Field>
          <Field label="Email" htmlFor="support-email" required>
            <input id="support-email" name="email" type="email" required value={form.email} onChange={onChange} className={inputClass(false)} />
          </Field>
          <Field label="Product" htmlFor="productName" optional className="sm:col-span-2">
            <input id="productName" name="productName" value={form.productName} onChange={onChange} className={inputClass(false)} />
          </Field>
          <Field label={type.prompt} htmlFor="question" required className="sm:col-span-2">
            <textarea
              id="question"
              name="question"
              rows={4}
              required
              value={form.question}
              onChange={onChange}
              placeholder={type.placeholder}
              className={`${inputClass(false)} resize-none`}
            />
          </Field>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-muted transition-colors hover:border-forest hover:bg-sage">
          <Paperclip size={18} className="shrink-0 text-forest" />
          <span className="min-w-0 truncate">
            {files.length > 0 ? files.map((f) => f.name).join(", ") : "Attach photos or a PDF (optional, max 5MB)"}
          </span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="hidden" />
        </label>

        {result && (
          <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${result.ok ? "bg-mint text-forest" : "bg-[#fde8e8] text-filred"}`}>
            {result.message}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <button type="button" onClick={onBack} className="h-12 rounded-full px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-sage">
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="h-12 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}
