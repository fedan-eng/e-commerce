// app/admin_console/sales/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Trash2, Search, X } from "lucide-react";

const PAYMENT_OPTIONS = [
  { value: "cash",     label: "Cash" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "pos",      label: "POS" },
];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "", address: "", city: "",
  paymentMethod: "cash", discount: "", orderNote: "", saleDate: "",
};

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const inputCls = "w-full bg-canvas border border-line rounded-xl px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ghost focus:outline-none focus:border-pine focus:bg-white transition-colors";
const labelCls = "block text-[12px] font-semibold text-muted mb-1.5";

export default function SalesEntryPage() {
  const [products,   setProducts]   = useState([]);
  const [form,       setForm]       = useState({ ...EMPTY_FORM, saleDate: todayLocal() });
  const [lines,      setLines]      = useState([]); // { productId, name, price, quantity, color }
  const [query,      setQuery]      = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sales,      setSales]      = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [revenue,    setRevenue]    = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSales, setLoadingSales] = useState(true);

  useEffect(() => {
    axios.get("/api/products?limit=500")
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => toast.error("Couldn't load products"));
  }, []);

  const loadSales = (p = page) => {
    setLoadingSales(true);
    axios.get(`/api/admin/sales?page=${p}&limit=15`)
      .then(({ data }) => {
        setSales(data.sales || []);
        setSalesTotal(data.total || 0);
        setRevenue(data.revenue || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error("Couldn't load sales"))
      .finally(() => setLoadingSales(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadSales(page); }, [page]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, products]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addProduct = (p) => {
    setLines(ls => {
      const existing = ls.find(l => l.productId === p._id);
      if (existing) return ls.map(l => l.productId === p._id ? { ...l, quantity: Number(l.quantity) + 1 } : l);
      return [...ls, { productId: p._id, name: p.name, price: p.price, quantity: 1, color: "", colors: (p.colors || []).map(c => c.name).filter(Boolean) }];
    });
    setQuery("");
  };
  const updateLine = (i, k, v) => setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  const removeLine = (i) => setLines(ls => ls.filter((_, idx) => idx !== i));

  const subTotal = lines.reduce((a, l) => a + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0);
  const discount = Math.max(0, Number(form.discount) || 0);
  const total    = Math.max(0, subTotal - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) return toast.error("Customer name is required");
    if (!lines.length)          return toast.error("Add at least one product");
    if (discount > subTotal)    return toast.error("Discount cannot exceed subtotal");

    setSubmitting(true);
    try {
      await axios.post("/api/admin/sales", {
        ...form,
        saleDate: form.saleDate ? new Date(form.saleDate).toISOString() : undefined,
        items: lines.map(({ productId, price, quantity, color }) => ({ productId, price, quantity, color })),
      });
      toast.success("Sale recorded");
      setForm({ ...EMPTY_FORM, saleDate: todayLocal() });
      setLines([]);
      if (page === 1) loadSales(1);
      else setPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sale? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/sales?id=${id}`);
      toast.success("Sale deleted");
      loadSales(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sale");
    }
  };

  return (
    <div className="text-ink">
      <Toaster position="top-right" toastOptions={{ style: { background: "#0f472b", color: "#ffffff", borderRadius: 999, fontSize: 13 }, iconTheme: { primary: "#d7f75b", secondary: "#0f472b" } }} />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Offline Sales</div>
        <h1 className="text-[28px] font-poppins font-bold text-pine leading-tight">Sales Entry</h1>
        <p className="text-[12px] text-faint mt-1">Record in-store, phone or WhatsApp sales. They count towards dashboard totals.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-10">
        {/* ── Left: customer + items ── */}
        <div className="xl:col-span-2 space-y-5">
          <section className="bg-white border border-line rounded-3xl p-5">
            <h2 className="text-[15px] font-poppins font-semibold text-pine mb-4">Customer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>First name *</label><input className={inputCls} value={form.firstName} onChange={set("firstName")} placeholder="e.g. Walk-in" /></div>
              <div><label className={labelCls}>Last name</label><input className={inputCls} value={form.lastName} onChange={set("lastName")} /></div>
              <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.phone} onChange={set("phone")} inputMode="tel" /></div>
              <div><label className={labelCls}>Email</label><input className={inputCls} type="email" value={form.email} onChange={set("email")} /></div>
              <div><label className={labelCls}>Address</label><input className={inputCls} value={form.address} onChange={set("address")} /></div>
              <div><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={set("city")} /></div>
            </div>
          </section>

          <section className="bg-white border border-line rounded-3xl p-5">
            <h2 className="text-[15px] font-poppins font-semibold text-pine mb-4">Items</h2>

            {/* Product search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input className={`${inputCls} pl-9`} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products to add…" />
              {matches.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-line rounded-2xl overflow-hidden shadow-[0_18px_40px_-16px_rgba(15,71,43,0.35)]">
                  {matches.map(p => (
                    <button type="button" key={p._id} onClick={() => addProduct(p)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] hover:bg-zest/30 transition-colors">
                      <span className="truncate">{p.name} <span className="text-faint">· {p.category}</span></span>
                      <span className="text-pine font-semibold whitespace-nowrap">₦{fmt(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {lines.length === 0 ? (
              <div className="text-[13px] text-faint py-8 text-center border-2 border-dashed border-line rounded-2xl"><div className="text-2xl mb-1" aria-hidden>🛒</div>No items yet. Search above to add some.</div>
            ) : (
              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={l.productId} className="grid grid-cols-12 gap-2 items-end bg-sage rounded-2xl p-3">
                    <div className="col-span-12 sm:col-span-4 text-[13px] font-medium truncate pb-2.5">{l.name}</div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className={labelCls}>Qty</label>
                      <input className={inputCls} type="number" min="1" value={l.quantity} onChange={e => updateLine(i, "quantity", e.target.value)} />
                    </div>
                    <div className="col-span-8 sm:col-span-3">
                      <label className={labelCls}>Unit price ₦</label>
                      <input className={inputCls} type="number" min="0" step="0.01" value={l.price} onChange={e => updateLine(i, "price", e.target.value)} />
                    </div>
                    <div className="col-span-10 sm:col-span-2">
                      <label className={labelCls}>Color</label>
                      {l.colors.length ? (
                        <select className={inputCls} value={l.color} onChange={e => updateLine(i, "color", e.target.value)}>
                          <option value="">—</option>
                          {l.colors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : <div className="text-[12px] text-faint py-2">—</div>}
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end pb-1.5">
                      <button type="button" onClick={() => removeLine(i)} aria-label="Remove item"
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-faint hover:text-[#c53030] hover:bg-[#fdecec] transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right: payment + summary ── */}
        <section className="bg-white border border-line rounded-3xl p-5 h-fit xl:sticky xl:top-8 space-y-4">
          <h2 className="text-[15px] font-poppins font-semibold text-pine">Payment</h2>
          <div>
            <label className={labelCls}>Sale date</label>
            <input className={inputCls} type="datetime-local" max={todayLocal()} value={form.saleDate} onChange={set("saleDate")} />
          </div>
          <div>
            <label className={labelCls}>Method</label>
            <select className={inputCls} value={form.paymentMethod} onChange={set("paymentMethod")}>
              {PAYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Discount ₦</label>
            <input className={inputCls} type="number" min="0" step="0.01" value={form.discount} onChange={set("discount")} />
          </div>
          <div>
            <label className={labelCls}>Note</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={form.orderNote} onChange={set("orderNote")} />
          </div>

          <div className="border-t border-line pt-4 space-y-1.5 text-[12px]">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>₦{fmt(subTotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-[#c53030]"><span>Discount</span><span>-₦{fmt(discount)}</span></div>}
            <div className="flex justify-between items-baseline pt-2"><span className="text-[14px] font-semibold text-ink">Total</span><span className="text-[22px] font-poppins font-bold text-pine">₦{fmt(total)}</span></div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-full text-[14px] font-semibold bg-pine text-white hover:bg-pine-deep hover:shadow-[0_10px_24px_-10px_rgba(15,71,43,0.6)] disabled:opacity-50 transition-all">
            <Plus size={14} /> {submitting ? "Saving…" : "Record Sale"}
          </button>
        </section>
      </form>

      {/* ── Recent manual sales ── */}
      <div className="flex items-end justify-between mb-3 gap-4 flex-wrap">
        <h2 className="text-[15px] font-poppins font-semibold text-pine">Recorded Sales</h2>
        <div className="text-[12px] text-faint flex items-center gap-2">{salesTotal} sales <span className="text-pine font-semibold bg-zest px-2.5 py-0.5 rounded-full">₦{fmt(revenue)}</span></div>
      </div>

      <div className="bg-white border border-line rounded-3xl overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="text-[11px] tracking-[0.08em] uppercase text-faint bg-sage">
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Items</th>
              <th className="px-5 py-3 font-semibold">Method</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">By</th>
              <th className="px-5 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {loadingSales ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[12px] text-faint">Loading…</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-[13px] text-faint"><div className="text-2xl mb-1" aria-hidden>🧾</div>No manual sales recorded yet</td></tr>
            ) : sales.map(s => (
              <tr key={s._id} className="border-b border-line last:border-0 hover:bg-[#fafcf9] transition-colors">
                <td className="px-5 py-3 text-[12px] text-muted whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-3 text-[12px]">
                  <Link href={`/admin_console/orders/${s._id}`} className="text-ink font-medium no-underline hover:text-pine">
                    {s.firstName} {s.lastName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-[12px] text-muted max-w-[240px] truncate">
                  {(s.items || []).map(it => `${it.name} ×${it.quantity}`).join(", ")}
                </td>
                <td className="px-5 py-3 text-[12px] text-muted capitalize">{PAYMENT_OPTIONS.find(o => o.value === s.paymentMethod)?.label || s.paymentMethod}</td>
                <td className="px-5 py-3 text-[13px] font-semibold text-pine whitespace-nowrap">₦{fmt(s.total)}</td>
                <td className="px-5 py-3 text-[12px] text-faint whitespace-nowrap">{s.recordedBy ? `${s.recordedBy.firstName || ""} ${s.recordedBy.lastName || ""}`.trim() : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(s._id)} aria-label="Delete sale"
                    className="w-8 h-8 inline-flex items-center justify-center rounded-xl text-faint hover:text-[#c53030] hover:bg-[#fdecec] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-[12px]">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3.5 py-1.5 rounded-full bg-white border border-line text-pine font-medium disabled:opacity-30 hover:border-pine hover:bg-mint">Prev</button>
          <span className="text-faint">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3.5 py-1.5 rounded-full bg-white border border-line text-pine font-medium disabled:opacity-30 hover:border-pine hover:bg-mint">Next</button>
        </div>
      )}
    </div>
  );
}
