"use client";

import { useState } from "react";
import { AlertTriangle, Lightbulb, MessageCircle, UploadCloud } from "lucide-react";

const INQUIRY_TYPES = [
  { value: "general",    label: "General question", icon: MessageCircle, field: "Your question",      placeholder: "How can we help you?" },
  { value: "redress",    label: "Complaint",        icon: AlertTriangle, field: "Describe the issue", placeholder: "Tell us what went wrong and what outcome you'd like..." },
  { value: "suggestion", label: "Suggestion",       icon: Lightbulb,     field: "Your suggestion",    placeholder: "We'd love to hear your thoughts..." },
];

const inputCls =
  "mt-2 block h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-forest";
const labelCls = "text-[13px] font-semibold text-ink";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    inquiryType: "general",
    name:        "",
    email:       "",
    question:    "",
    reason:      "",
    productName: "",
  });
  const [files, setFiles]     = useState([]);
  const [message, setMessage] = useState("");
  const [failed, setFailed]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setFailed(false);

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    files.forEach((f) => payload.append("files", f));

    try {
      const res = await fetch("/api/contact", { method: "POST", body: payload });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessage(data.message || "Message sent! We'll get back to you soon.");
      setFormData({ inquiryType: "general", name: "", email: "", question: "", reason: "", productName: "" });
      setFiles([]);
    } catch {
      setFailed(true);
      setMessage("We couldn't send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const active = INQUIRY_TYPES.find((t) => t.value === formData.inquiryType) || INQUIRY_TYPES[0];

  return (
    <section className="rounded-[28px] bg-sage p-5 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-forest md:text-[28px]">Send us a message</h2>
      <p className="mt-1 text-sm text-muted">Fill in the form and our support team will reply by email.</p>

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Inquiry type */}
        <p className={labelCls}>What can we help you with?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INQUIRY_TYPES.map(({ value, label, icon: Icon }) => {
            const on = formData.inquiryType === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => setFormData((prev) => ({ ...prev, inquiryType: value }))}
                className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  on ? "bg-forest text-white" : "bg-white text-forest hover:bg-mint"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Name & Email */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="name">Name <span className="text-filred">*</span></label>
            <input type="text" name="name" id="name" autoComplete="name" value={formData.name} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="email">Email address <span className="text-filred">*</span></label>
            <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required className={inputCls} />
          </div>
        </div>

        {/* Message */}
        <div className="mt-4">
          <label className={labelCls} htmlFor="question">{active.field} <span className="text-filred">*</span></label>
          <textarea
            name="question" id="question" value={formData.question} onChange={handleChange} required rows={5}
            placeholder={active.placeholder}
            className={`${inputCls} h-auto resize-none py-3`}
          />
        </div>

        {/* Reason & Product */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="reason">Reason <span className="font-normal text-faint">(optional)</span></label>
            <input id="reason" type="text" name="reason" value={formData.reason} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="productName">Product name <span className="font-normal text-faint">(optional)</span></label>
            <input type="text" id="productName" name="productName" value={formData.productName} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        {/* Files */}
        <div className="mt-4">
          <p className={labelCls}>Attachments <span className="font-normal text-faint">(optional)</span></p>
          <label
            htmlFor="file" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
            className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-forest/30 bg-white px-4 py-6 text-center text-sm transition-colors hover:border-forest"
          >
            {files.length === 0 ? (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-forest">
                  <UploadCloud size={20} />
                </span>
                <p className="mt-3 text-ink">
                  Drag and drop files or <span className="font-semibold text-forest underline underline-offset-2">browse</span>
                </p>
                <p className="mt-1 text-xs text-faint">PDF, JPG or PNG, up to 5MB</p>
              </>
            ) : (
              <div className="w-full">
                {files.map((f, i) => <p key={i} className="truncate text-xs text-ink">{f.name}</p>)}
                <p className="mt-2 text-xs font-semibold text-forest">Change files</p>
              </div>
            )}
            <input id="file" type="file" name="files" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFiles(Array.from(e.target.files))} multiple className="hidden" />
          </label>
        </div>

        <button
          type="submit" disabled={loading}
          className="mt-6 h-12 w-full rounded-full bg-forest px-8 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {loading ? "Sending…" : "Send message"}
        </button>

        {message && (
          <p role="status" className={`mt-3 text-sm font-medium ${failed ? "text-filred" : "text-forest"}`}>
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
