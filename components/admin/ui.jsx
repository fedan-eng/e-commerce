// components/admin/ui.jsx
// Shared building blocks for the admin console: one look for every page.
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { normalizeStatusKey, normalizeStatusLabel } from "@/lib/orderStatus";

export const cx = (...classes) => classes.filter(Boolean).join(" ");

// ── Layout ───────────────────────────────────────────────────

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="m-0 font-poppins text-[22px] font-semibold tracking-[-0.01em] text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-faint">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
    </div>
  );
}

export function Card({ as: Tag = "section", className, children, ...rest }) {
  return (
    <Tag className={cx("min-w-0 rounded-xl border border-edge bg-white", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <h2 className="m-0 font-poppins text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-faint">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Buttons ──────────────────────────────────────────────────

const BUTTON_VARIANTS = {
  primary:   "border-pine bg-pine text-white hover:border-pine-deep hover:bg-pine-deep",
  secondary: "border-[#dfe3e1] bg-white text-ink hover:border-[#cdd3d0] hover:bg-canvas",
  ghost:     "border-transparent bg-transparent text-pine hover:bg-hover",
  danger:    "border-[#f3c4c4] bg-white text-[#b91c1c] hover:bg-[#fdeeee]",
};
const BUTTON_SIZES = {
  md: "h-10 px-3.5 text-[13px]",
  sm: "h-8 px-2.5 text-xs",
};

export function Button({ variant = "secondary", size = "md", href, className, children, ...rest }) {
  const cls = cx(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium no-underline transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
  if (href) return <Link href={href} className={cls} {...rest}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

export function IconButton({ label, className, children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sub transition-colors hover:bg-hover hover:text-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-[9px] bg-[#f1f3f2] p-[3px]">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "h-[34px] cursor-pointer rounded-[7px] px-3 text-[13px] font-medium transition-colors",
            value === o.value ? "bg-white text-ink shadow-[0_1px_2px_rgba(16,24,20,0.1)]" : "text-sub hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Dropdown menu ────────────────────────────────────────────
// renderTrigger receives { open, toggle } so any button can open it.
// Clicking an item marked data-menu-item closes the menu.

export function Dropdown({ renderTrigger, align = "right", className, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey  = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {renderTrigger({ open, toggle: () => setOpen(o => !o) })}
      {open && (
        <div
          role="menu"
          onClick={e => { if (e.target.closest("[data-menu-item]")) setOpen(false); }}
          className={cx(
            "absolute top-[calc(100%+6px)] z-50 min-w-[210px] rounded-[10px] border border-edge bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(16,24,20,0.28)]",
            align === "left" ? "left-0" : "right-0",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ href, onClick, danger, selected, description, icon: Icon, children }) {
  const cls = cx(
    "flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] no-underline transition-colors hover:bg-hover",
    danger ? "text-[#b91c1c]" : selected ? "font-medium text-pine" : "text-ink",
  );
  const body = (
    <>
      {Icon && <Icon size={15} className="shrink-0 text-faint" aria-hidden />}
      <span className="min-w-0">
        <span className="block truncate">{children}</span>
        {description && <span className="block truncate text-xs text-faint">{description}</span>}
      </span>
    </>
  );
  if (href) return <Link href={href} role="menuitem" data-menu-item className={cls}>{body}</Link>;
  return <button type="button" role="menuitem" data-menu-item onClick={onClick} className={cls}>{body}</button>;
}

export const MenuLabel = ({ children }) => (
  <div className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.05em] text-faint">{children}</div>
);
export const MenuSeparator = () => <div className="mx-1 my-1.5 h-px bg-edge" />;

// ── Status + trend badges ────────────────────────────────────

const STATUS_STYLES = {
  confirmed:  "bg-[#fef7e6] text-[#a16207]",
  pending:    "bg-[#fef7e6] text-[#a16207]",
  processing: "bg-[#eef3ff] text-[#1d4ed8]",
  processed:  "bg-[#eef3ff] text-[#1d4ed8]",
  shipped:    "bg-[#f3eefe] text-[#6d28d9]",
  intransit:  "bg-[#e9f5fc] text-[#0369a1]",
  delivered:  "bg-[#eaf7ef] text-[#15803d]",
  approved:   "bg-[#eaf7ef] text-[#15803d]",
  cancelled:  "bg-[#fdeeee] text-[#b91c1c]",
  returned:   "bg-[#fff1e8] text-[#c2410c]",
};
export const statusStyle = status => STATUS_STYLES[normalizeStatusKey(status)] || "bg-[#f1f3f2] text-sub";

export function StatusBadge({ status, children }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyle(status))}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children ?? normalizeStatusLabel(status)}
    </span>
  );
}

export function Trend({ value }) {
  if (value == null || !isFinite(value)) return null;
  const up = value >= 0;
  return (
    <span className={cx(
      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
      up ? "bg-[#eaf7ef] text-[#15803d]" : "bg-[#fdeeee] text-[#b91c1c]",
    )}>
      {up ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// trend: % change vs the previous period, or null with a `note` shown instead
export function StatCard({ label, value, icon: Icon, trend, note, loading, hint = "vs previous period" }) {
  return (
    <Card className="px-5 py-[18px]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] text-sub">{label}</span>
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hover text-pine">
            <Icon size={18} aria-hidden />
          </span>
        )}
      </div>
      <div className="mt-1.5 break-words font-poppins text-xl font-semibold tracking-[-0.01em] text-ink sm:text-2xl">
        {loading ? <Skeleton className="h-7 w-28" /> : value}
      </div>
      <div className="mt-2.5 flex min-h-[22px] flex-wrap items-center gap-2 text-xs text-faint">
        {!loading && trend != null && <><Trend value={trend} />{hint}</>}
        {!loading && trend == null && note && <span>{note}</span>}
      </div>
    </Card>
  );
}

// ── Feedback ─────────────────────────────────────────────────

export const Skeleton = ({ className, ...rest }) => (
  <span className={cx("block animate-pulse rounded-md bg-[#eef0ef]", className)} aria-hidden {...rest} />
);

export const Spinner = ({ className }) => (
  <span className={cx("inline-block h-6 w-6 animate-spin rounded-full border-2 border-edge border-t-pine", className)} aria-label="Loading" />
);

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="px-6 py-12 text-center">
      {Icon && (
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-hover text-pine">
          <Icon size={22} aria-hidden />
        </span>
      )}
      <h3 className="m-0 mb-1 font-poppins text-base font-semibold text-ink">{title}</h3>
      {description && <p className="m-0 text-[13px] text-faint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
