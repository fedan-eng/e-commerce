"use client";

import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

export default function ShareModal({ productName, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Check out ${productName} on FIL Store!`;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const targets = [
    { label: "WhatsApp", icon: FaWhatsapp, className: "bg-[#25d366]", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { label: "X", icon: FaXTwitter, className: "bg-black", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { label: "Facebook", icon: FaFacebookF, className: "bg-[#1877f2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share this product"
        className="w-full max-w-md rounded-t-[28px] bg-white p-6 sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-forest">Share this product</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-forest hover:bg-sage">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex justify-center gap-5">
          {targets.map(({ label, icon: Icon, className, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${label}`}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 ${className}`}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-sage p-1.5 pl-4">
          <input readOnly value={url} aria-label="Product link" className="min-w-0 flex-1 bg-transparent text-sm text-muted outline-none" />
          <button
            type="button"
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
