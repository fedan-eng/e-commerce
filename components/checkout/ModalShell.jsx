"use client";
// components/checkout/ModalShell.jsx — bottom sheet on mobile, centred card on desktop.
// Header and footer stay put while the body scrolls.
import { useEffect } from "react";
import { X } from "lucide-react";

export default function ModalShell({ title, subtitle, onClose, header, footer, children, labelledBy = "modal-title" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white font-roboto shadow-2xl sm:max-h-[90vh] sm:max-w-[640px] sm:rounded-[28px]"
      >
        <div className="shrink-0 border-b border-line px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={labelledBy} className="text-[22px] font-bold leading-tight tracking-tight text-forest sm:text-[26px]">
                {title}
              </h2>
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-forest transition-colors hover:bg-mint"
            >
              <X size={18} />
            </button>
          </div>
          {header && <div className="mt-5">{header}</div>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">{children}</div>

        {footer && <div className="shrink-0 border-t border-line bg-white px-5 py-4 sm:px-7">{footer}</div>}
      </div>
    </div>
  );
}
