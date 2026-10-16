// components/admin/format.js
// Number and time formatting shared by admin pages.

export function money(n) {
  return "₦" + (Number(n) || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

// ₦4.8M / ₦320k / ₦950: for chart axes and tight spaces
export function moneyShort(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return "₦" + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (Math.abs(v) >= 1e3) return "₦" + Math.round(v / 1e3) + "k";
  return "₦" + Math.round(v);
}

export function compact(n) {
  const v = Math.round(Number(n) || 0);
  return v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(v);
}

export function timeAgo(date) {
  const s = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return "Yesterday";
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function initials(first, last, fallback = "?") {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase() || fallback.toUpperCase();
}
