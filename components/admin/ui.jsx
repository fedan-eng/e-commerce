// components/admin/ui.jsx
// Shared building blocks for the admin console: one look for every page.
"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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

// The menu is position: fixed so scrolling table boxes can't clip it; it flips
// above the trigger when there isn't room below.
export function Dropdown({ renderTrigger, align = "right", className, children }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown  = e => {
      if (ref.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey   = e => { if (e.key === "Escape") setOpen(false); };
    const onMove  = e => { if (!menuRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !ref.current || !menuRef.current) return;
    const t = ref.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();
    const gap = 6, edge = 8;
    let top = t.bottom + gap;
    if (top + m.height > window.innerHeight - edge && t.top - gap - m.height > edge) top = t.top - gap - m.height;
    let left = align === "left" ? t.left : t.right - m.width;
    left = Math.min(Math.max(edge, left), window.innerWidth - m.width - edge);
    setPos({ top, left });
  }, [open, align]);

  return (
    <div ref={ref} className="relative">
      {renderTrigger({ open, toggle: () => { setPos(null); setOpen(o => !o); } })}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          onClick={e => { if (e.target.closest("[data-menu-item]")) setOpen(false); }}
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: "hidden" }}
          className={cx(
            "fixed z-[60] max-h-[min(420px,70vh)] min-w-[210px] overflow-y-auto rounded-[10px] border border-edge bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(16,24,20,0.28)]",
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

// ── Forms ────────────────────────────────────────────────────

export const inputCls = cx(
  "h-10 w-full rounded-lg border border-[#dfe3e1] bg-white px-3 text-[13px] text-ink outline-none transition-colors",
  "placeholder:text-faint focus:border-pine focus:shadow-[0_0_0_3px_rgba(15,71,43,0.1)] disabled:bg-canvas disabled:text-faint",
);
export const selectCls = cx(inputCls, "cursor-pointer");
export const textareaCls = cx(inputCls, "h-auto resize-y py-2.5 leading-relaxed");

export function Field({ label, hint, className, children }) {
  return (
    <div className={cx("min-w-0", className)}>
      {label && <div className="mb-1.5 text-[13px] font-medium text-sub">{label}</div>}
      {children}
      {hint && <div className="mt-1 text-xs text-faint">{hint}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, onSubmit, onClear, placeholder, label, className }) {
  return (
    <div className={cx("relative min-w-0", className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onSubmit?.(); }}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className={cx(inputCls, "pl-9 pr-9")}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-faint hover:bg-hover hover:text-ink"
        >
          <X size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, indeterminate }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate && !checked; }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={!!checked}
      onChange={onChange}
      aria-label={label}
      className="h-4 w-4 cursor-pointer accent-pine"
    />
  );
}

// Toggle switch for on/off settings
export function Switch({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-faint">{description}</span>}
      </span>
      <input type="checkbox" checked={!!checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-[#d5ddd8] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-pine peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-pine/40"
      />
    </label>
  );
}

// ── Navigation within a card ─────────────────────────────────

export function Tabs({ label, tabs, value, onChange }) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar flex gap-1 overflow-x-auto border-b border-edge px-3 sm:px-5">
      {tabs.map(t => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={cx(
              "-mb-px inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-2.5 text-[13px] font-medium transition-colors",
              on ? "border-pine text-pine" : "border-transparent text-sub hover:text-ink",
            )}
          >
            {t.label}
            {t.count != null && (
              <span className={cx("rounded-full px-1.5 py-px text-[11px]", on ? "bg-pine-tint text-pine" : "bg-[#f1f3f2] text-sub")}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Page numbers to show: 1 … 4 5 6 … 20
function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const pages = [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  pages.forEach((p, i) => { if (i && p - pages[i - 1] > 1) out.push("…" + p); out.push(p); });
  return out;
}

export function Pagination({ page, totalPages, total, pageSize, onChange, noun = "results" }) {
  if (!total) return null;
  const first = (page - 1) * pageSize + 1;
  const last  = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-4 py-3 sm:px-5">
      <span className="text-[13px] text-faint">
        Showing {first.toLocaleString()}–{last.toLocaleString()} of {total.toLocaleString()} {noun}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={14} aria-hidden /> <span className="hidden sm:inline">Previous</span>
          </Button>
          <div className="hidden items-center gap-0.5 sm:flex">
            {pageList(page, totalPages).map(p => typeof p === "string"
              ? <span key={p} className="px-1 text-faint">…</span>
              : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={cx(
                    "h-8 min-w-8 cursor-pointer rounded-lg px-2 text-[13px] font-medium transition-colors",
                    p === page ? "bg-pine-tint text-pine" : "text-sub hover:bg-hover",
                  )}
                >
                  {p}
                </button>
              ))}
          </div>
          <span className="px-2 text-[13px] text-faint sm:hidden">{page} / {totalPages}</span>
          <Button size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
            <span className="hidden sm:inline">Next</span> <ChevronRight size={14} aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Tables ───────────────────────────────────────────────────

export const TH = "whitespace-nowrap border-y border-edge bg-[#fafbfa] px-4 py-2.5 text-left text-xs font-medium text-faint";
export const TD = "border-b border-[#eef0ef] px-4 py-3 align-middle";

// Green bar shown above a list while rows are selected
export function BulkBar({ count, onClear, children }) {
  if (!count) return null;
  return (
    <div className="mx-3 mb-3 flex flex-wrap items-center gap-2 rounded-[10px] bg-pine py-2 pl-3.5 pr-2 text-white sm:mx-5">
      <span className="mr-auto text-[13px] font-medium">{count} selected</span>
      {children}
      <button
        type="button"
        onClick={onClear}
        className="h-8 cursor-pointer rounded-lg border border-white/20 bg-white/10 px-2.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
      >
        Clear
      </button>
    </div>
  );
}

export const bulkBtnCls = "inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/20 bg-white/10 px-2.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50";

export function Avatar({ first, last, email, size = "md" }) {
  return (
    <span className={cx(
      "flex shrink-0 items-center justify-center rounded-full bg-pine-tint font-semibold text-pine",
      size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs",
    )}>
      {((first?.[0] || "") + (last?.[0] || "")).toUpperCase() || (email?.[0] || "?").toUpperCase()}
    </span>
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
