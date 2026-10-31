// app/admin_console/sales/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, X, ReceiptText, Package } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  PageHeader, Card, CardHeader, Button, Field, SearchInput, Pagination, EmptyState, Spinner,
  inputCls, selectCls, textareaCls, TH, TD, cx,
} from "@/components/admin/ui";
import { money } from "@/components/admin/format";

const PAGE_SIZE = 15;

const PAYMENT_OPTIONS = [
  { value: "cash",     label: "Cash" },
  { value: "transfer", label: "Bank transfer" },
  { value: "pos",      label: "POS" },
];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "", address: "", city: "",
  paymentMethod: "cash", discount: "", orderNote: "", saleDate: "",
};

function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function SalesEntryPage() {
  const { refreshAlerts } = useAdmin();
  const [products,   setProducts]   = useState([]);
  const [form,       setForm]       = useState({ ...EMPTY_FORM, saleDate: todayLocal() });
  const [lines,      setLines]      = useState([]); // { productId, name, image, price, quantity, color, colors }
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
    axios.get(`/api/admin/sales?page=${p}&limit=${PAGE_SIZE}`)
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
      return [...ls, { productId: p._id, name: p.name, image: p.image, price: p.price, quantity: 1, color: "", colors: (p.colors || []).map(c => c.name).filter(Boolean) }];
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
      refreshAlerts();
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
      refreshAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sale");
    }
  };

  const paymentLabel = v => PAYMENT_OPTIONS.find(o => o.value === v)?.label || v;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales entry"
        description="Record in-store, phone or WhatsApp sales. They count towards the dashboard totals."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Left: customer + items ── */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader title="Customer" description="Only the first name is required" />
            <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
              <Field label="First name *"><input className={inputCls} value={form.firstName} onChange={set("firstName")} placeholder="e.g. Walk-in" /></Field>
              <Field label="Last name"><input className={inputCls} value={form.lastName} onChange={set("lastName")} /></Field>
              <Field label="Phone"><input className={inputCls} value={form.phone} onChange={set("phone")} inputMode="tel" /></Field>
              <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={set("email")} /></Field>
              <Field label="Address"><input className={inputCls} value={form.address} onChange={set("address")} /></Field>
              <Field label="City"><input className={inputCls} value={form.city} onChange={set("city")} /></Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Items" description={lines.length ? `${lines.length} product${lines.length === 1 ? "" : "s"} added` : "Search for products to add them"} />
            <div className="px-5 pb-5">
              <div className="relative mb-4">
                <SearchInput value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder="Search products to add…" label="Search products to add" />
                {matches.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[10px] border border-edge bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(16,24,20,0.28)]">
                    {matches.map(p => (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => addProduct(p)}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-hover"
                      >
                        {p.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-md bg-hover object-cover" />
                          : <span className="h-8 w-8 shrink-0 rounded-md bg-hover" />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-ink">{p.name}</span>
                          <span className="block text-xs text-faint">{p.category}</span>
                        </span>
                        <span className="shrink-0 font-medium">{money(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {lines.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#d5ddd8] px-4 py-8 text-center text-[13px] text-faint">
                  <Package size={22} className="mx-auto mb-2 text-faint" aria-hidden />
                  No items yet
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#eef0ef] rounded-lg border border-edge">
                  {lines.map((l, i) => (
                    <div key={l.productId} className="grid grid-cols-2 items-end gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_80px_130px_130px_auto]">
                      <div className="col-span-2 flex min-w-0 items-center gap-3 self-center sm:col-span-1">
                        {l.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={l.image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-hover object-cover" />
                          : <span className="h-10 w-10 shrink-0 rounded-lg bg-hover" />}
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium">{l.name}</div>
                          <div className="text-xs text-faint">{money((Number(l.price) || 0) * (Number(l.quantity) || 0))}</div>
                        </div>
                      </div>
                      <Field label="Qty" className="col-span-1">
                        <input className={inputCls} type="number" min="1" value={l.quantity} onChange={e => updateLine(i, "quantity", e.target.value)} aria-label={`Quantity of ${l.name}`} />
                      </Field>
                      <Field label="Unit price (₦)" className="col-span-1">
                        <input className={inputCls} type="number" min="0" step="0.01" value={l.price} onChange={e => updateLine(i, "price", e.target.value)} aria-label={`Unit price of ${l.name}`} />
                      </Field>
                      <Field label="Colour" className="col-span-1">
                        {l.colors.length ? (
                          <select className={selectCls} value={l.color} onChange={e => updateLine(i, "color", e.target.value)} aria-label={`Colour of ${l.name}`}>
                            <option value="">—</option>
                            {l.colors.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <div className="flex h-10 items-center text-[13px] text-faint">No colours</div>}
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        aria-label={`Remove ${l.name}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-faint transition-colors hover:bg-[#fdeeee] hover:text-[#b91c1c]"
                      >
                        <X size={16} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right: payment + summary ── */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader title="Payment" />
          <div className="flex flex-col gap-3 px-5 pb-5">
            <Field label="Sale date">
              <input className={inputCls} type="datetime-local" max={todayLocal()} value={form.saleDate} onChange={set("saleDate")} />
            </Field>
            <Field label="Method">
              <select className={selectCls} value={form.paymentMethod} onChange={set("paymentMethod")}>
                {PAYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Discount (₦)">
              <input className={inputCls} type="number" min="0" step="0.01" value={form.discount} onChange={set("discount")} placeholder="0" />
            </Field>
            <Field label="Note">
              <textarea className={textareaCls} rows={3} value={form.orderNote} onChange={set("orderNote")} placeholder="Optional" />
            </Field>

            <div className="mt-1 flex flex-col gap-1.5 border-t border-edge pt-3 text-[13px]">
              <div className="flex justify-between text-sub"><span>Subtotal</span><span>{money(subTotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sub"><span>Discount</span><span className="text-[#b91c1c]">−{money(discount)}</span></div>}
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-medium">Total</span>
                <span className="font-poppins text-xl font-semibold">{money(total)}</span>
              </div>
            </div>

            <Button type="submit" variant="primary" className="mt-1 h-11 w-full" disabled={submitting}>
              <Plus size={16} aria-hidden /> {submitting ? "Saving…" : "Record sale"}
            </Button>
          </div>
        </Card>
      </form>

      {/* ── Recorded manual sales ── */}
      <Card>
        <CardHeader
          title="Recorded sales"
          description={`${salesTotal.toLocaleString()} sale${salesTotal === 1 ? "" : "s"} · ${money(revenue)} in total`}
        />
        {loadingSales && !sales.length ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : sales.length === 0 ? (
          <EmptyState icon={ReceiptText} title="No manual sales yet" description="Sales you record above will be listed here." />
        ) : (
          <div className={cx(loadingSales && "opacity-60")}>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={TH}>Date</th>
                    <th className={TH}>Customer</th>
                    <th className={TH}>Items</th>
                    <th className={TH}>Method</th>
                    <th className={cx(TH, "text-right")}>Total</th>
                    <th className={TH}>Recorded by</th>
                    <th className={cx(TH, "w-12")}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s._id} className="hover:bg-[#fafbfa]">
                      <td className={cx(TD, "whitespace-nowrap text-sub")}>{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className={TD}>
                        <Link href={`/admin_console/orders/${s._id}`} className="font-medium text-ink no-underline hover:text-pine">
                          {[s.firstName, s.lastName].filter(Boolean).join(" ")}
                        </Link>
                      </td>
                      <td className={cx(TD, "max-w-[260px] truncate text-sub")}>{(s.items || []).map(it => `${it.name} ×${it.quantity}`).join(", ")}</td>
                      <td className={cx(TD, "text-sub")}>{paymentLabel(s.paymentMethod)}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>{money(s.total)}</td>
                      <td className={cx(TD, "whitespace-nowrap text-faint")}>{s.recordedBy ? `${s.recordedBy.firstName || ""} ${s.recordedBy.lastName || ""}`.trim() : "—"}</td>
                      <td className={cx(TD, "text-right")}>
                        <button
                          type="button"
                          onClick={() => handleDelete(s._id)}
                          aria-label="Delete sale"
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-faint transition-colors hover:bg-[#fdeeee] hover:text-[#b91c1c]"
                        >
                          <Trash2 size={15} aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:hidden">
              {sales.map(s => (
                <div key={s._id} className="flex items-start gap-3 border-t border-[#eef0ef] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <Link href={`/admin_console/orders/${s._id}`} className="truncate text-[13px] font-medium text-ink no-underline">
                        {[s.firstName, s.lastName].filter(Boolean).join(" ")}
                      </Link>
                      <span className="shrink-0 text-[13px] font-semibold">{money(s.total)}</span>
                    </div>
                    <div className="truncate text-xs text-sub">{(s.items || []).map(it => `${it.name} ×${it.quantity}`).join(", ")}</div>
                    <div className="text-xs text-faint">
                      {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {paymentLabel(s.paymentMethod)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(s._id)}
                    aria-label="Delete sale"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-faint hover:bg-[#fdeeee] hover:text-[#b91c1c]"
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} total={salesTotal} pageSize={PAGE_SIZE} onChange={setPage} noun="sales" />
          </div>
        )}
      </Card>
    </div>
  );
}
