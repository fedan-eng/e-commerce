// components/profile/orders/StatusPill.jsx — coloured order status, e.g. "In Transit"
const STYLES = {
  pending: "bg-[#fff4cc] text-[#8a6700]",
  processing: "bg-[#e3eefc] text-[#1d4ed8]",
  confirmed: "bg-mint text-forest",
  shipped: "bg-[#ece6ff] text-[#5b21b6]",
  intransit: "bg-[#e3eefc] text-[#1d4ed8]",
  delivered: "bg-forest text-white",
  cancelled: "bg-[#fde8e8] text-filred",
  returned: "bg-[#fde8e8] text-filred",
};

// "InTransit" → "In Transit"
export const statusLabel = (status = "") => status.replace(/([a-z])([A-Z])/g, "$1 $2");

export default function StatusPill({ status }) {
  const key = String(status || "").replace(/\s/g, "").toLowerCase();
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STYLES[key] || "bg-sage text-muted"}`}>
      {statusLabel(status) || "Pending"}
    </span>
  );
}
