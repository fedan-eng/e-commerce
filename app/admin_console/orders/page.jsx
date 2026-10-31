// app/admin_console/orders/page.jsx
"use client";
import { Fragment, Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus, Download, MoreVertical, ChevronRight, ChevronDown, Eye, FileText, Copy,
  MessageCircle, Phone, Mail, XCircle, ShoppingBag,
} from "lucide-react";
import { ALL_STATUSES, normalizeStatusKey, matchStatusLabel, shortId } from "@/lib/orderStatus";
import { toCSV, downloadCSV } from "@/lib/csv";
import { downloadInvoice, downloadInvoices } from "@/lib/invoice";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  PageHeader, Card, Button, Tabs, SearchInput, Dropdown, MenuItem, MenuSeparator, StatusBadge,
  Pagination, Checkbox, BulkBar, bulkBtnCls, Avatar, EmptyState, Spinner, statusStyle, selectCls, TH, TD, cx,
} from "@/components/admin/ui";
import { money, localPhone, telLink, whatsappLink } from "@/components/admin/format";

const PAGE_SIZE = 15;

const STATUS_TABS = [
  { value: "all",        label: "All",        stat: "total" },
  { value: "Confirmed",  label: "Confirmed",  stat: "confirmed" },
  { value: "Processing", label: "Processing", stat: "processing" },
  { value: "Shipped",    label: "Shipped",    stat: "shipped" },
  { value: "In Transit", label: "In transit", stat: "intransit" },
  { value: "Delivered",  label: "Delivered",  stat: "delivered" },
  { value: "Cancelled",  label: "Cancelled",  stat: "cancelled" },
];

const DAYS_OPTIONS = [
  { label: "All time",     value: "" },
  { label: "Last 7 days",  value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const orderTotal = o => {
  if (o.total != null) return parseFloat(o.total);
  if (o.subTotal != null) return parseFloat(o.subTotal);
  return (o.items || []).reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.quantity || 1), 0);
};
const customerName = o => [o.firstName, o.lastName].filter(Boolean).join(" ") || o.email || "Customer";
const itemsSummary = o => (o.items || []).map(it => `${it.name}${(parseInt(it.quantity, 10) || 1) > 1 ? ` ×${it.quantity}` : ""}`).join(", ");
const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Status <select> styled as a coloured pill
function StatusSelect({ order, onChange, busy }) {
  return (
    <select
      value={matchStatusLabel(order.status) || order.status}
      onChange={e => onChange(order, e.target.value)}
      disabled={busy}
      aria-label={`Status for order ${shortId(order._id)}`}
      className={cx("h-7 cursor-pointer rounded-full border-0 pl-2.5 pr-1 text-xs font-medium outline-none disabled:opacity-50", statusStyle(order.status))}
    >
      {!matchStatusLabel(order.status) && <option value={order.status}>{order.status}</option>}
      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function OrderMenu({ order, onCancel }) {
  const phone = localPhone(order.phone);
  const copyId = () => navigator.clipboard?.writeText(String(order._id)).then(() => toast.success("Order ID copied"));
  return (
    <Dropdown
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={`More actions for order ${shortId(order._id)}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sub transition-colors hover:bg-hover hover:text-ink"
        >
          <MoreVertical size={16} aria-hidden />
        </button>
      )}
    >
      <MenuItem icon={Eye} href={`/admin_console/orders/${order._id}`}>View details</MenuItem>
      <MenuItem icon={FileText} onClick={() => downloadInvoice(order).catch(() => toast.error("Couldn't create the invoice"))}>Download invoice (PDF)</MenuItem>
      <MenuItem icon={Copy} onClick={copyId}>Copy order ID</MenuItem>
      {(phone || order.email) && <MenuSeparator />}
      {phone && (
        <MenuItem icon={MessageCircle} onClick={() => window.open(whatsappLink(phone, `Hi ${order.firstName || ""}, this is FIL about your order #${shortId(order._id)}.`), "_blank", "noopener")}>
          Message on WhatsApp
        </MenuItem>
      )}
      {phone && <MenuItem icon={Phone} onClick={() => { window.location.href = telLink(phone); }}>Call {phone}</MenuItem>}
      {order.email && <MenuItem icon={Mail} onClick={() => { window.location.href = `mailto:${order.email}`; }}>Email customer</MenuItem>}
      {normalizeStatusKey(order.status) !== "cancelled" && (
        <>
          <MenuSeparator />
          <MenuItem icon={XCircle} danger onClick={() => onCancel(order)}>Cancel order</MenuItem>
        </>
      )}
    </Dropdown>
  );
}

function OrderItems({ order }) {
  return (
    <div className="flex flex-col gap-2">
      {(order.items || []).map((it, i) => (
        <div key={i} className="flex items-center gap-3 text-[13px]">
          {it.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={it.image} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-white object-cover" />
            : <span className="h-9 w-9 shrink-0 rounded-lg bg-white" />}
          <span className="min-w-0 flex-1">
            {it.productId
              ? <Link href={`/admin_console/products/${it.productId}`} className="block truncate text-ink no-underline hover:text-pine">{it.name}</Link>
              : <span className="block truncate">{it.name}</span>}
            <span className="block text-xs text-faint">
              {[it.category, it.color, it.sku].filter(Boolean).join(" · ") || "—"}
            </span>
          </span>
          <span className="shrink-0 text-sub">{it.quantity} × {money(it.price)}</span>
        </div>
      ))}
    </div>
  );
}

function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshAlerts } = useAdmin();

  const [loading, setLoading]       = useState(true);
  const [orders, setOrders]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats]           = useState(null);
  const [updating, setUpdating]     = useState(null);
  const [expanded, setExpanded]     = useState({});
  const [selected, setSelected]     = useState({});
  const [bulkBusy, setBulkBusy]     = useState(false);
  const [exporting, setExporting]   = useState(false);

  const [page, setPage]                 = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [searchInput, setSearchInput]   = useState(searchParams.get("search") || "");
  const [search, setSearch]             = useState(searchParams.get("search") || "");
  const [days, setDays]                 = useState(searchParams.get("days") || "");
  const [source, setSource]             = useState(searchParams.get("source") || "");

  // Follow links into this page while it's open (top-bar search, dashboard links)
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "all";
  useEffect(() => {
    if (urlSearch !== search) { setSearch(urlSearch); setSearchInput(urlSearch); setPage(1); }
    if (urlStatus !== statusFilter) { setStatusFilter(urlStatus); setPage(1); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch, urlStatus]);

  // Keep the URL in step with the filters (shareable, survives refresh)
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    if (days) params.set("days", days);
    if (source) params.set("source", source);
    if (page > 1) params.set("page", page);
    const qs = params.toString();
    const newUrl = qs ? `/admin_console/orders?${qs}` : "/admin_console/orders";
    if (window.location.pathname + window.location.search !== newUrl) router.replace(newUrl, { scroll: false });
  }, [statusFilter, search, days, source, page, router]);

  const filterParams = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (search) params.append("search", search);
    if (days) params.append("days", days);
    if (source) params.append("source", source);
    return params;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filterParams();
      params.set("page", page);
      params.set("limit", PAGE_SIZE);
      params.set("_t", Date.now());
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Couldn't load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setSelected({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, search, days, source]);

  const patchStatus = async (orderId, status) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Unknown error");
    }
  };

  const updateStatus = async (order, newStatus) => {
    setUpdating(order._id);
    try {
      await patchStatus(order._id, newStatus);
      toast.success(`Order #${shortId(order._id)} is now ${newStatus}`);
      await fetchOrders();
      refreshAlerts();
    } catch (err) {
      toast.error(`Couldn't update status: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const cancelOrder = order => {
    if (window.confirm(`Cancel order #${shortId(order._id)}? The customer will be told by email.`)) updateStatus(order, "Cancelled");
  };

  // ── Selection + bulk actions ──
  const selectedOrders = orders.filter(o => selected[o._id]);
  const allSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const toggleAll = () => setSelected(allSelected ? {} : Object.fromEntries(orders.map(o => [o._id, true])));
  const toggleOne = id => setSelected(s => ({ ...s, [id]: !s[id] }));

  const bulkStatus = async status => {
    const targets = selectedOrders.filter(o => normalizeStatusKey(o.status) !== normalizeStatusKey(status));
    if (!targets.length) { toast(`Those orders are already ${status}`); return; }
    if (!window.confirm(`Mark ${targets.length} order${targets.length === 1 ? "" : "s"} as ${status}? Customers are emailed about the change.`)) return;
    setBulkBusy(true);
    let failed = 0;
    for (const o of targets) {
      try { await patchStatus(o._id, status); } catch { failed++; }
    }
    setBulkBusy(false);
    if (failed) toast.error(`${failed} order${failed === 1 ? "" : "s"} couldn't be updated`);
    else toast.success(`${targets.length} order${targets.length === 1 ? "" : "s"} marked ${status}`);
    setSelected({});
    await fetchOrders();
    refreshAlerts();
  };

  const bulkInvoices = () => downloadInvoices(selectedOrders).catch(() => toast.error("Couldn't create the invoices"));

  // ── CSV of every order matching the filters ──
  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = filterParams();
      params.set("limit", "10000");
      const res = await fetch(`/api/admin/orders?${params}`);
      const { orders: rows = [] } = await res.json();
      const columns = [
        { header: "Order ID",       value: o => String(o._id) },
        { header: "Date",           value: o => new Date(o.createdAt).toISOString() },
        { header: "Source",         value: o => o.source || "online" },
        { header: "Customer",       value: customerName },
        { header: "Email",          value: o => o.email },
        { header: "Phone",          value: o => localPhone(o.phone) },
        { header: "Items",          value: itemsSummary },
        { header: "Total",          value: orderTotal },
        { header: "Payment Method", value: o => o.paymentMethod },
        { header: "Status",         value: o => o.status },
      ];
      downloadCSV(`fil-orders${statusFilter !== "all" ? "-" + normalizeStatusKey(statusFilter) : ""}.csv`, toCSV(rows, columns));
    } catch {
      toast.error("Couldn't export orders");
    } finally {
      setExporting(false);
    }
  };

  const resetPage = setter => v => { setter(v); setPage(1); };
  const hasFilters = search || days || source || statusFilter !== "all";
  const clearFilters = () => { setSearch(""); setSearchInput(""); setDays(""); setSource(""); setStatusFilter("all"); setPage(1); };

  return (
    <div>
      <PageHeader
        title="Orders"
        description={stats ? `${stats.total.toLocaleString()} order${stats.total === 1 ? "" : "s"}${days || source || search ? " matching your filters" : ""}` : "Loading…"}
        actions={
          <>
            <Button onClick={exportCSV} disabled={exporting || !total}>
              {exporting ? <Spinner className="h-4 w-4" /> : <Download size={16} aria-hidden />} Export CSV
            </Button>
            <Button variant="primary" href="/admin_console/sales">
              <Plus size={16} aria-hidden /> Record a sale
            </Button>
          </>
        }
      />

      <Card>
        <Tabs
          label="Order status"
          value={statusFilter}
          onChange={resetPage(setStatusFilter)}
          tabs={STATUS_TABS.map(t => ({ value: t.value, label: t.label, count: stats ? stats[t.stat] : null }))}
        />

        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-5">
          <SearchInput
            className="min-w-[220px] flex-1"
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => { setSearch(searchInput.trim()); setPage(1); }}
            onClear={() => { setSearchInput(""); setSearch(""); setPage(1); }}
            placeholder="Search by order ID, email or name — press Enter"
            label="Search orders"
          />
          <select value={days} onChange={e => resetPage(setDays)(e.target.value)} className={cx(selectCls, "w-auto")} aria-label="Date range">
            {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={source} onChange={e => resetPage(setSource)(e.target.value)} className={cx(selectCls, "w-auto")} aria-label="Source">
            <option value="">All sources</option>
            <option value="online">Online</option>
            <option value="manual">Manual</option>
          </select>
          {hasFilters && <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>}
        </div>

        <BulkBar count={selectedOrders.length} onClear={() => setSelected({})}>
          <Dropdown
            align="left"
            renderTrigger={({ open, toggle }) => (
              <button type="button" onClick={toggle} aria-expanded={open} disabled={bulkBusy} className={bulkBtnCls}>
                {bulkBusy ? "Updating…" : "Change status"} <ChevronDown size={13} aria-hidden />
              </button>
            )}
          >
            {ALL_STATUSES.map(s => (
              <MenuItem key={s} onClick={() => bulkStatus(s)}><StatusBadge status={s} /></MenuItem>
            ))}
          </Dropdown>
          <button type="button" onClick={bulkInvoices} className={bulkBtnCls}>
            <FileText size={13} aria-hidden /> Download invoices
          </button>
        </BulkBar>

        {loading && !orders.length ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description={hasFilters ? "Try another status or clear the filters." : "Orders will show up here as they come in."}
            action={hasFilters && <Button onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <div className={cx("transition-opacity", loading && "opacity-60")}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={cx(TH, "w-10 pr-0")}><Checkbox checked={allSelected} indeterminate={selectedOrders.length > 0} onChange={toggleAll} label="Select all orders on this page" /></th>
                    <th className={cx(TH, "w-8 px-0")}><span className="sr-only">Expand</span></th>
                    <th className={TH}>Order</th>
                    <th className={TH}>Date</th>
                    <th className={TH}>Customer</th>
                    <th className={TH}>Items</th>
                    <th className={cx(TH, "text-right")}>Total</th>
                    <th className={TH}>Status</th>
                    <th className={cx(TH, "w-12")}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const isExp = expanded[o._id];
                    const isSel = !!selected[o._id];
                    return (
                      <Fragment key={o._id}>
                        <tr className={cx("transition-colors", isSel ? "bg-pine-tint/60" : "hover:bg-[#fafbfa]")}>
                          <td className={cx(TD, "pr-0")}><Checkbox checked={isSel} onChange={() => toggleOne(o._id)} label={`Select order ${shortId(o._id)}`} /></td>
                          <td className={cx(TD, "px-0")}>
                            <button
                              type="button"
                              onClick={() => setExpanded(p => ({ ...p, [o._id]: !p[o._id] }))}
                              aria-expanded={!!isExp}
                              aria-label={`${isExp ? "Hide" : "Show"} items in order ${shortId(o._id)}`}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-faint hover:bg-hover hover:text-ink"
                            >
                              <ChevronRight size={15} className={cx("transition-transform", isExp && "rotate-90")} aria-hidden />
                            </button>
                          </td>
                          <td className={cx(TD, "whitespace-nowrap")}>
                            <Link href={`/admin_console/orders/${o._id}`} className="font-medium text-pine no-underline hover:underline">#{shortId(o._id)}</Link>
                            {o.source === "manual" && <span className="ml-2 rounded-md bg-[#f1f3f2] px-1.5 py-px text-[11px] font-medium text-sub">Manual</span>}
                          </td>
                          <td className={cx(TD, "whitespace-nowrap text-sub")}>{fmtDate(o.createdAt)}</td>
                          <td className={TD}>
                            <div className="flex items-center gap-2.5">
                              <Avatar first={o.firstName} last={o.lastName} email={o.email} size="sm" />
                              <div className="min-w-0 max-w-[200px]">
                                <div className="truncate text-ink">{customerName(o)}</div>
                                {o.email && <div className="truncate text-xs text-faint">{o.email}</div>}
                              </div>
                            </div>
                          </td>
                          <td className={cx(TD, "max-w-[220px] truncate text-sub")} title={itemsSummary(o)}>{itemsSummary(o) || "—"}</td>
                          <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>{money(orderTotal(o))}</td>
                          <td className={TD}><StatusSelect order={o} onChange={updateStatus} busy={updating === o._id} /></td>
                          <td className={cx(TD, "text-right")}><OrderMenu order={o} onCancel={cancelOrder} /></td>
                        </tr>
                        {isExp && (
                          <tr>
                            <td colSpan={2} className="border-b border-[#eef0ef] bg-[#fafbfa]" />
                            <td colSpan={7} className="border-b border-[#eef0ef] bg-[#fafbfa] px-4 py-3">
                              <OrderItems order={o} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col md:hidden">
              <label className="flex items-center gap-2.5 border-y border-edge bg-[#fafbfa] px-3 py-2 text-xs text-faint">
                <Checkbox checked={allSelected} indeterminate={selectedOrders.length > 0} onChange={toggleAll} label="Select all orders on this page" />
                Select all
              </label>
              {orders.map(o => (
                <div key={o._id} className={cx("border-b border-[#eef0ef] px-3 py-3", selected[o._id] && "bg-pine-tint/60")}>
                  <div className="flex items-start gap-2.5">
                    <span className="pt-0.5"><Checkbox checked={!!selected[o._id]} onChange={() => toggleOne(o._id)} label={`Select order ${shortId(o._id)}`} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/admin_console/orders/${o._id}`} className="text-[13px] font-medium text-pine no-underline">#{shortId(o._id)}</Link>
                        <span className="text-[13px] font-semibold">{money(orderTotal(o))}</span>
                      </div>
                      <div className="mt-0.5 truncate text-[13px] text-ink">{customerName(o)}</div>
                      <div className="truncate text-xs text-faint">{fmtDate(o.createdAt)} · {(o.items || []).length} item{(o.items || []).length === 1 ? "" : "s"}{o.source === "manual" ? " · Manual" : ""}</div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusSelect order={o} onChange={updateStatus} busy={updating === o._id} />
                        <OrderMenu order={o} onCancel={cancelOrder} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onChange={setPage} noun="orders" />
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <AdminOrdersPage />
    </Suspense>
  );
}
