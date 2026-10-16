// app/admin_console/orders/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AlertModal from "@/components/AlertModal";
import Image from "next/image";
import { Suspense } from "react";

const STATUS_COLORS = {
  confirmed: {
    text: "text-[#a16207]",
    bg: "bg-[#fef6dc]",
    border: "border-[#f3dc9a]",
    hex: "#b7791f",
  },
  processing: {
    text: "text-[#1d6fb0]",
    bg: "bg-[#e7f1fb]",
    border: "border-[#c3dbf1]",
    hex: "#1d6fb0",
  },
  shipped: {
    text: "text-[#6d3fc8]",
    bg: "bg-[#f0e9fc]",
    border: "border-[#d9c9f5]",
    hex: "#6d3fc8",
  },
  intransit: {
    text: "text-[#2563eb]",
    bg: "bg-[#e8f0fe]",
    border: "border-[#c5d7fb]",
    hex: "#2563eb",
  },
  delivered: {
    text: "text-[#15803d]",
    bg: "bg-[#e3f6e9]",
    border: "border-[#bfe5cc]",
    hex: "#15803d",
  },
  cancelled: {
    text: "text-[#c53030]",
    bg: "bg-[#fdecec]",
    border: "border-[#f3c4c4]",
    hex: "#c53030",
  },
  pending: {
    text: "text-[#a16207]",
    bg: "bg-[#fef6dc]",
    border: "border-[#f3dc9a]",
    hex: "#b7791f",
  },
};

const ALL_STATUSES = [
  "all",
  "Confirmed",
  "Pending",
  "Processing",
  "Shipped",
  "In Transit",
  "Delivered",
  "Cancelled",
];
const ALL_ORDER_STATUSES = [
  "Processing",
  "Confirmed",
  "Shipped",
  "In Transit",
  "Delivered",
  "Cancelled",
];
const DAYS_OPTIONS = [
  { label: "All time", value: "" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const STAT_CARDS = [
  { label: "Total orders", key: "total", color: "#0f472b" },
  { label: "Confirmed", key: "confirmed", color: "#b7791f" },
  { label: "Processing", key: "processing", color: "#1d6fb0" },
  { label: "Shipped", key: "shipped", color: "#6d3fc8" },
  { label: "In Transit", key: "intransit", color: "#2563eb" },
  { label: "Delivered", key: "delivered", color: "#15803d" },
  { label: "Cancelled", key: "cancelled", color: "#c53030" },
];

function getStatusStyle(k) {
  return (
    STATUS_COLORS[k?.toLowerCase().replace(/\s/g, "")] || {
      text: "text-muted",
      bg: "bg-sage",
      border: "border-line-strong",
      hex: "#7c8b84",
    }
  );
}

function StatusBadge({ status }) {
  const ss = getStatusStyle(status?.toLowerCase());
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${ss.text} ${ss.bg} ${ss.border}`}
    >
      {status}
    </span>
  );
}

function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    intransit: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [days, setDays] = useState(searchParams.get("days") || "");
  const [alertModal, setAlertModal] = useState({ show: false, message: "" });

  // Sync URL params from state - single source of truth
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    if (days) params.set("days", days);
    if (page > 1) params.set("page", page);
    const qs = params.toString();
    const newUrl = qs ? `/admin_console/orders?${qs}` : "/admin_console/orders";

    // Only navigate if URL actually changed
    const currentUrl =
      window.location.pathname + (window.location.search || "");
    if (currentUrl !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [statusFilter, search, days, page, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, _t: Date.now() });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search) params.append("search", search);
      if (days) params.append("days", days);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setAlertModal({
        show: true,
        message: "Failed to load orders. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search, days]);

  const submitSearch = () => {
    const v = searchInput.trim();
    setSearch(v);
    setPage(1);
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };
  const handleStatus = (s) => {
    setStatusFilter(s);
    setPage(1);
  };
  const handleDays = (d) => {
    setDays(d);
    setPage(1);
  };
  const changePage = (p) => {
    setPage(p);
  };
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        const data = await res.json();
        setAlertModal({
          show: true,
          message: `Failed to update status: ${data.message || "Unknown error"}`,
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      setAlertModal({
        show: true,
        message: "Network error while updating status",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getTotal = (order) => {
    if (order.total != null) return parseFloat(order.total).toLocaleString();
    if (order.subTotal != null)
      return parseFloat(order.subTotal).toLocaleString();
    return (order.items || [])
      .reduce(
        (acc, i) =>
          acc + parseFloat(i.price || 0) * parseFloat(i.quantity || 1),
        0,
      )
      .toLocaleString();
  };

  const Pagination = () =>
    totalPages > 1 ? (
      <div className="flex justify-between items-center px-5 py-3 border-t border-line">
        <span className="text-[11px] text-faint">
          Page {page} of {totalPages} &middot; {total} orders
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => changePage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3.5 py-1.5 border rounded-full text-[12px] font-medium transition-all
            ${
              page === 1
                ? "border-line text-ghost cursor-default bg-transparent"
                : "border-line text-pine cursor-pointer hover:border-pine hover:bg-mint bg-transparent"
            }`}
          >
            ← Prev
          </button>
          <button
            onClick={() => changePage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-3.5 py-1.5 border rounded-full text-[12px] font-medium transition-all
            ${
              page === totalPages
                ? "border-line text-ghost cursor-default bg-transparent"
                : "border-line text-pine cursor-pointer hover:border-pine hover:bg-mint bg-transparent"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="w-full max-w-full">
      {/* Page header */}
      <div className="mb-6">
        <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">
          Management
        </div>
        <h1 className="text-[28px] font-poppins font-bold text-pine leading-tight">
          Orders
          <span className="text-faint text-base font-roboto font-medium ml-2">
            ({total})
          </span>
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {STAT_CARDS.map(({ label, key, color }) => (
          <div
            key={key}
            className="relative overflow-hidden bg-white border border-line rounded-3xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span className="absolute -right-3 -top-3 w-12 h-12 rounded-full opacity-15" style={{ background: color }} />
            <div className="flex items-center gap-1.5 text-[12px] text-faint font-medium mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </div>
            <div className="text-2xl font-poppins font-bold" style={{ color }}>
              {stats[key] ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-3xl p-4 mb-4">
        <div className="flex flex-col gap-3">
          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Search by order ID, email or name…"
                className="w-full h-11 bg-canvas border border-line rounded-full pl-10 pr-10 text-[13px] text-ink placeholder-ghost outline-none focus:border-pine focus:bg-white transition-colors"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-faint hover:text-pine"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={submitSearch}
              className="shrink-0 h-11 bg-pine text-white rounded-full px-6 text-[13px] font-semibold hover:bg-pine-deep transition-colors cursor-pointer border-none"
            >
              Search
            </button>
          </div>

          {/* Second row: days + status chips */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={days}
              onChange={(e) => handleDays(e.target.value)}
              className="h-9 bg-white border border-line-strong rounded-full px-3.5 text-[12px] font-medium text-ink outline-none cursor-pointer hover:border-pine"
            >
              {DAYS_OPTIONS.map((o) => (
                <option
                  key={o.value}
                  value={o.value}
                  style={{ background: "#ffffff" }}
                >
                  {o.label}
                </option>
              ))}
            </select>

            <div className="flex gap-1.5 flex-wrap">
              {ALL_STATUSES.map((s) => {
                const active = statusFilter === s;
                const ss = getStatusStyle(s.toLowerCase());
                return (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border transition-all whitespace-nowrap
                      ${
                        active
                          ? `${ss.text} ${ss.bg} ${ss.border}`
                          : "text-muted bg-transparent border-line hover:border-pine hover:text-pine"
                      }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filter chips */}
          {(search || days) && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-line">
              {search && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zest/35 border border-pine/25 rounded-full text-[11px] font-medium text-pine">
                  {search.length > 20
                    ? search.slice(0, 20) + "…"
                    : `"${search}"`}
                  <button
                    onClick={clearSearch}
                    className="hover:text-pine-deep cursor-pointer"
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              )}
              {days && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zest/35 border border-pine/25 rounded-full text-[11px] font-medium text-pine">
                  {DAYS_OPTIONS.find((d) => d.value === days)?.label}
                  <button
                    onClick={() => handleDays("")}
                    className="hover:text-pine-deep cursor-pointer"
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table / cards */}
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-faint text-[13px] bg-white border border-line rounded-3xl">
          <div className="w-7 h-7 rounded-full border-[3px] border-mint border-t-pine animate-spin" />
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white border border-line rounded-3xl">
          <div className="text-3xl mb-2" aria-hidden>📭</div>
          <div className="text-faint text-[13px] mb-2">No orders found</div>
          {(search || days || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setDays("");
                setStatusFilter("all");
                setPage(1);
              }}
              className="text-[12px] font-semibold text-pine hover:text-pine-deep underline underline-offset-2 bg-transparent border-none cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white border border-line rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ minWidth: 700 }}
              >
                <thead>
                  <tr className="bg-sage">
                    {/* expand toggle col */}
                    <th className="w-10 px-4 py-3.5" />
                    {[
                      "SN",
                      "Order date",
                      "Order number",
                      "Customer email",
                      "Order qty",
                      "Total",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] tracking-[.08em] text-faint uppercase font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const sKey = order.status?.toLowerCase();
                    const ss = getStatusStyle(sKey);
                    const isExp = expanded[order._id];
                    return (
                      <>
                        <tr
                          key={order._id}
                          className="border-b border-line hover:bg-[#fafcf9] transition-colors cursor-pointer"
                          onClick={() => toggleExpand(order._id)}
                        >
                          {/* chevron */}
                          <td className="px-4 py-3.5 text-faint">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              style={{
                                transform: isExp
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                                transition: "transform .2s",
                              }}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-faint">
                            {idx + 1 + (page - 1) * 15}
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-faint whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td
                            className="px-4 py-3.5 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/admin_console/orders/${order._id}`}
                              className="text-[12px] font-semibold text-pine no-underline hover:underline"
                            >
                              Order #{String(order._id).slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td
                            className="px-4 py-3.5 max-w-[180px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.email ? (
                              <a
                                href={`mailto:${order.email}`}
                                className="text-[12px] text-[#1d6fb0] no-underline hover:underline truncate block"
                              >
                                {order.email}
                              </a>
                            ) : (
                              <span className="text-[12px] text-faint">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-muted">
                            {order.items?.length || 0}
                          </td>
                          <td className="px-4 py-3.5 text-[13px] font-semibold text-ink whitespace-nowrap">
                            ₦{getTotal(order)}
                          </td>
                          <td
                            className="px-4 py-3.5 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={
                                ALL_ORDER_STATUSES.find(
                                  (s) =>
                                    s.toLowerCase().replace(/[-\s]+/g, "") ===
                                    order.status
                                      ?.toLowerCase()
                                      .replace(/[-\s]+/g, ""),
                                ) ||
                                order.status.replace(/([A-Z])/g, " $1").trim()
                              }
                              onChange={(e) =>
                                updateStatus(order._id, e.target.value)
                              }
                              style={{
                                background: ss.hex + "12",
                                borderColor: ss.hex + "44",
                                color: ss.hex,
                              }}
                              className={`border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase cursor-pointer outline-none ${updating === order._id ? "opacity-50" : ""}`}
                            >
                              {ALL_ORDER_STATUSES.map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                  style={{
                                    background: "#ffffff",
                                    color: getStatusStyle(s.toLowerCase()).hex,
                                  }}
                                >
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className="px-4 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/admin_console/orders/${order._id}`}
                              className="text-[12px] font-semibold text-pine no-underline px-3.5 py-1.5 bg-mint rounded-full hover:bg-zest transition-colors whitespace-nowrap"
                            >
                              View details ↗
                            </Link>
                          </td>
                        </tr>

                        {/* Expanded items sub-table */}
                        {isExp && order.items?.length > 0 && (
                          <tr
                            key={`${order._id}-exp`}
                            className="border-b border-line"
                          >
                            <td />
                            <td colSpan={8} className="px-4 py-3 bg-[#fafcf9]">
                              <table
                                className="w-full border-collapse"
                                style={{ minWidth: 500 }}
                              >
                                <thead>
                                  <tr className="border-b border-line">
                                    {[
                                      "SKU | ID",
                                      "Product",
                                      "Category",
                                      "Unit price",
                                      "Qty",
                                      "Status",
                                      "Action",
                                    ].map((h) => (
                                      <th
                                        key={h}
                                        className="pb-2 pr-5 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, i) => {
                                    const iStatus =
                                      item.status?.toLowerCase() || sKey;
                                    const iss = getStatusStyle(iStatus);
                                    return (
                                      <tr
                                        key={i}
                                        className="border-b border-line last:border-0"
                                      >
                                        <td className="pt-2.5 pr-5 text-[11px] text-faint whitespace-nowrap">
                                          {item.sku || "—"}
                                        </td>
                                        <td className="pt-2.5 pr-5">
                                          <div className="flex items-center gap-2.5">
                                            {item.image && (
                                              <Image
                                                src={item.image}
                                                alt=""
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-lg object-cover bg-sage shrink-0"
                                              />
                                            )}
                                            <span className="text-[12px] text-ink truncate max-w-[160px]">
                                              {item.name}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="pt-2.5 pr-5 text-[12px] text-ink whitespace-nowrap">
                                          {item.category || "—"}
                                        </td>
                                        <td className="pt-2.5 pr-5 text-[12px] text-muted whitespace-nowrap">
                                          ₦
                                          {parseFloat(
                                            item.price,
                                          ).toLocaleString()}
                                        </td>
                                        <td className="pt-2.5 pr-5 text-[12px] text-muted">
                                          {item.quantity}
                                        </td>
                                        <td className="pt-2.5 pr-5 whitespace-nowrap">
                                          <StatusBadge
                                            status={item.status || order.status}
                                          />
                                        </td>
                                        <td className="pt-2.5">
                                          {item.productId && (
                                            <Link
                                              href={`/admin_console/products/${item.productId}`}
                                              className="text-[11px] font-medium text-pine no-underline bg-white border border-line rounded-full px-2.5 py-1 whitespace-nowrap hover:border-pine transition-all"
                                            >
                                              View details ↗
                                            </Link>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden flex flex-col gap-2.5 w-full">
            {orders.map((order, idx) => {
              const sKey = order.status?.toLowerCase();
              const ss = getStatusStyle(sKey);
              return (
                <div
                  key={order._id}
                  className="bg-white border border-line rounded-3xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <Link
                          href={`/admin_console/orders/${order._id}`}
                          className="text-[12px] font-semibold text-pine no-underline hover:underline"
                        >
                          Order #{String(order._id).slice(-8).toUpperCase()}
                        </Link>
                        <div className="text-[10px] text-faint mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </div>
                      </div>
                      <span className="text-[15px] font-bold text-ink shrink-0">
                        ₦{getTotal(order)}
                      </span>
                    </div>

                    {order.email && (
                      <div className="text-[11px] text-[#1d6fb0] truncate mb-2">
                        {order.email}
                      </div>
                    )}

                    <div className="text-[11px] text-faint mb-3">
                      {order.items?.length || 0} item
                      {order.items?.length !== 1 ? "s" : ""}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-line">
                      <select
                        value={
                          ALL_ORDER_STATUSES.find(
                            (s) =>
                              s.toLowerCase().replace(/[-\s]+/g, "") ===
                              order.status
                                ?.toLowerCase()
                                .replace(/[-\s]+/g, ""),
                          ) || order.status.replace(/([A-Z])/g, " $1").trim()
                        }
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        style={{
                          background: ss.hex + "12",
                          borderColor: ss.hex + "44",
                          color: ss.hex,
                        }}
                        className={`flex-1 min-w-0 border rounded-full px-3 py-2 text-[11px] font-semibold uppercase cursor-pointer outline-none ${updating === order._id ? "opacity-50" : ""}`}
                      >
                        {ALL_ORDER_STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            style={{
                              background: "#ffffff",
                              color: getStatusStyle(s.toLowerCase()).hex,
                            }}
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                      <Link
                        href={`/admin_console/orders/${order._id}`}
                        className="shrink-0 text-[12px] font-semibold text-pine no-underline px-4 py-2 bg-mint rounded-full hover:bg-zest transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            <Pagination />
          </div>
        </>
      )}

      {alertModal.show && (
        <AlertModal
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, message: "" })}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="text-ghost p-10 text-[13px]">Loading…</div>}
    >
      <AdminOrdersPage />
    </Suspense>
  );
}
