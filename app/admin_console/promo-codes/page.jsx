// app/admin_console/promo-codes/page.jsx
// Promo codes: create and edit the checkout rules, and see the orders each code brought in.
// Creator codes also show sales and the commission owed for the chosen period.
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Power, TicketPercent, CalendarDays, ChevronDown, ShoppingBag, Wallet, HandCoins, BadgePercent,
} from "lucide-react";
import {
  PageHeader, Card, CardHeader, Button, IconButton, Tabs, Field, Switch, EmptyState, Skeleton, StatusBadge,
  StatCard, Segmented, Dropdown, MenuItem, inputCls, TH, TD, cx,
} from "@/components/admin/ui";
import { money, compact, timeAgo } from "@/components/admin/format";

const API = "/api/admin/promocodes";

const EMPTY_FORM = {
  code: "", type: "general", discount: "10", creatorName: "", creatorHandle: "", commissionPercent: "",
  minCartValue: "", maxUses: "", expiresAt: "", firstPurchaseOnly: false, oneTimePerUser: true, active: true, note: "",
};

const RANGES = [
  { value: "all",       label: "All time" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "30d",       label: "Last 30 days" },
];

function rangeBounds(value) {
  const now = new Date();
  switch (value) {
    case "thisMonth": return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null };
    case "lastMonth": return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, -1) };
    case "30d":       return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), to: null };
    default:          return { from: null, to: null };
  }
}

async function send(url, method, body) {
  const res = await fetch(url, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
  const data = await res?.json().catch(() => ({}));
  if (!res?.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

const pad2 = n => String(n).padStart(2, "0");
const toDateInput = d => (d ? `${new Date(d).getFullYear()}-${pad2(new Date(d).getMonth() + 1)}-${pad2(new Date(d).getDate())}` : "");
const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const commissionOf = c => (c.type === "creator" ? (c.stats.sales * c.commissionPercent) / 100 : 0);

function statusOf(c) {
  if (!c.active) return { key: "archived", label: "Off" };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { key: "cancelled", label: "Expired" };
  if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { key: "returned", label: "Used up" };
  return { key: "approved", label: "Active" };
}

// ─── Add / edit form ──────────────────────────────────────────
function PromoForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(() => (isEdit
    ? {
        ...EMPTY_FORM, ...initial,
        discount: String(initial.discount),
        commissionPercent: initial.commissionPercent ? String(initial.commissionPercent) : "",
        minCartValue: initial.minCartValue ? String(initial.minCartValue) : "",
        maxUses: initial.maxUses ? String(initial.maxUses) : "",
        expiresAt: toDateInput(initial.expiresAt),
      }
    : EMPTY_FORM));
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const isCreator = form.type === "creator";

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      // End of the chosen day, in the admin's time zone
      const expiresAt = form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null;
      const body = { ...form, expiresAt };
      const data = isEdit ? await send(`${API}/${initial._id}`, "PATCH", body) : await send(API, "POST", body);
      toast.success(isEdit ? `${data.code.code} updated` : `${data.code.code} created`);
      onSaved(data.code);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader
        title={isEdit ? `Edit ${initial.code}` : "New promo code"}
        description={isCreator
          ? "Give the creator this code to share. Every order that uses it is counted under their name."
          : "Shoppers type this code at checkout to get the discount."}
      />
      <form onSubmit={submit} className="flex flex-col gap-5 border-t border-edge px-5 py-5">
        <Segmented
          label="Code type"
          value={form.type}
          onChange={v => set("type", v)}
          options={[{ value: "general", label: "General" }, { value: "creator", label: "Creator" }]}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Code" hint={isEdit ? "Codes can't be renamed. Create a new one instead." : "Letters, numbers, - or _. Saved in capitals."}>
            <input
              value={form.code}
              onChange={e => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder={isCreator ? "e.g. DAMMY10" : "e.g. SALE15"}
              maxLength={30}
              disabled={isEdit}
              required
              className={cx(inputCls, "font-mono uppercase tracking-wide")}
            />
          </Field>
          <Field label="Discount (%)">
            <input type="number" min="1" max="100" step="any" value={form.discount} onChange={e => set("discount", e.target.value)} required className={inputCls} />
          </Field>

          {isCreator && (
            <>
              <Field label="Creator name">
                <input value={form.creatorName} onChange={e => set("creatorName", e.target.value)} placeholder="e.g. Dammy" maxLength={80} required className={inputCls} />
              </Field>
              <Field label="Handle (optional)">
                <input value={form.creatorHandle} onChange={e => set("creatorHandle", e.target.value)} placeholder="e.g. @dammy on TikTok" maxLength={80} className={inputCls} />
              </Field>
              <Field label="Commission (%)" hint="Of product sales after the discount, delivery not included. Leave empty for none.">
                <input type="number" min="0" max="100" step="any" value={form.commissionPercent} onChange={e => set("commissionPercent", e.target.value)} placeholder="0" className={inputCls} />
              </Field>
            </>
          )}

          <Field label="Minimum cart value (₦)" hint="Leave empty for no minimum.">
            <input type="number" min="0" step="any" value={form.minCartValue} onChange={e => set("minCartValue", e.target.value)} placeholder="0" className={inputCls} />
          </Field>
          <Field label="Total uses allowed" hint="Across everyone. Leave empty for no limit.">
            <input type="number" min="0" step="1" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} placeholder="No limit" className={inputCls} />
          </Field>
          <Field label="Expires on" hint="Last day it works. Leave empty to never expire.">
            <input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="flex max-w-xl flex-col gap-4">
          <Switch
            checked={form.oneTimePerUser}
            onChange={e => set("oneTimePerUser", e.target.checked)}
            label="Once per customer"
            description="Each shopper can use it on one order. They need to be logged in."
          />
          <Switch
            checked={form.firstPurchaseOnly}
            onChange={e => set("firstPurchaseOnly", e.target.checked)}
            label="First order only"
            description="Only for shoppers who have never ordered before, with or without a code."
          />
          <Switch
            checked={form.active}
            onChange={e => set("active", e.target.checked)}
            label="Active"
            description="Turn off to stop it working at checkout. Its orders stay counted."
          />
        </div>

        <Field label="Note (optional)" hint="Only admins see this.">
          <input value={form.note} onChange={e => set("note", e.target.value)} placeholder="e.g. Agreed with Dammy on WhatsApp, paid monthly" maxLength={200} className={inputCls} />
        </Field>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create code"}</Button>
          <Button onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function PromoCodesPage() {
  const [codes,   setCodes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState("all");
  const [tab,     setTab]     = useState("all");
  const [editing, setEditing] = useState(null); // null | "new" | code

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = rangeBounds(range);
    const params = new URLSearchParams();
    if (from) params.set("from", from.toISOString());
    if (to) params.set("to", to.toISOString());
    try {
      const data = await send(`${API}?${params}`, "GET");
      setCodes(data.codes);
    } catch {
      toast.error("Couldn't load promo codes");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => (tab === "all" ? codes : codes.filter(c => c.type === tab)), [codes, tab]);
  const creators = codes.filter(c => c.type === "creator");
  const sum = (list, f) => list.reduce((a, c) => a + f(c), 0);
  const rangeLabel = RANGES.find(r => r.value === range).label;

  const statCards = [
    { label: "Orders from creator codes", value: sum(creators, c => c.stats.orders).toLocaleString(), icon: ShoppingBag },
    { label: "Creator sales",             value: money(sum(creators, c => c.stats.sales)),            icon: Wallet },
    { label: "Commission owed",           value: money(sum(creators, commissionOf)),                 icon: HandCoins },
    { label: "Discounts given (all codes)", value: money(sum(codes, c => c.stats.discount)),         icon: BadgePercent },
  ];

  const tabs = [
    { value: "all",     label: "All",     count: codes.length },
    { value: "creator", label: "Creator", count: creators.length },
    { value: "general", label: "General", count: codes.length - creators.length },
  ];

  const onSaved = saved => {
    setEditing(null);
    // Stats come from orders, so reload rather than guess them
    if (codes.some(c => c._id === saved._id)) setCodes(list => list.map(c => (c._id === saved._id ? { ...saved, stats: c.stats } : c)));
    else load();
  };

  const toggle = async c => {
    try {
      const { code } = await send(`${API}/${c._id}`, "PATCH", { active: !c.active });
      setCodes(list => list.map(x => (x._id === code._id ? { ...code, stats: x.stats } : x)));
      toast.success(code.active ? `${code.code} is on` : `${code.code} is off`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async c => {
    if (!window.confirm(`Delete ${c.code}? Shoppers won't be able to use it.`)) return;
    try {
      await send(`${API}/${c._id}`, "DELETE");
      setCodes(list => list.filter(x => x._id !== c._id));
      toast.success(`${c.code} deleted`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startEdit = c => { setEditing(c); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Promo codes"
        description={`Checkout discounts and creator codes. Order numbers: ${rangeLabel.toLowerCase()}.`}
        actions={
          <>
            <Dropdown
              renderTrigger={({ open, toggle: t }) => (
                <Button onClick={t} aria-expanded={open}>
                  <CalendarDays size={16} aria-hidden /> {rangeLabel} <ChevronDown size={14} aria-hidden />
                </Button>
              )}
            >
              {RANGES.map(r => <MenuItem key={r.value} selected={range === r.value} onClick={() => setRange(r.value)}>{r.label}</MenuItem>)}
            </Dropdown>
            {editing !== "new" && (
              <Button variant="primary" onClick={() => setEditing("new")}><Plus size={16} aria-hidden /> New code</Button>
            )}
          </>
        }
      />

      {editing && (
        <PromoForm
          key={editing === "new" ? "new" : editing._id}
          initial={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map(s => <StatCard key={s.label} {...s} loading={loading} note={rangeLabel} />)}
      </div>

      <Card>
        <Tabs label="Filter codes" tabs={tabs} value={tab} onChange={setTab} />
        {loading ? (
          <div className="flex flex-col gap-3 p-5">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={TicketPercent}
            title={tab === "creator" ? "No creator codes yet" : "No promo codes yet"}
            description={tab === "creator"
              ? "Make a code for a creator and every order that uses it is counted under their name."
              : "Create a code and shoppers can use it at checkout."}
            action={editing !== "new" && <Button variant="primary" onClick={() => setEditing("new")}><Plus size={16} aria-hidden /> New code</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className={TH}>Code</th>
                  <th className={TH}>For</th>
                  <th className={TH}>Rules</th>
                  <th className={cx(TH, "text-right")}>Orders</th>
                  <th className={cx(TH, "text-right")}>Sales</th>
                  <th className={cx(TH, "text-right")}>Commission</th>
                  <th className={TH}>Status</th>
                  <th className={TH}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(c => {
                  const status = statusOf(c);
                  const rules = [
                    c.firstPurchaseOnly && "First order",
                    c.oneTimePerUser && "Once per customer",
                    c.minCartValue > 0 && `Min ${money(c.minCartValue)}`,
                    c.maxUses > 0 && `${c.usedCount}/${c.maxUses} uses`,
                    c.expiresAt && `Until ${fmtDate(c.expiresAt)}`,
                  ].filter(Boolean);
                  return (
                    <tr key={c._id} className="hover:bg-[#fafbfa]">
                      <td className={TD}>
                        <span className="font-mono text-[13px] font-semibold tracking-wide text-ink">{c.code}</span>
                        <span className="block text-xs text-faint">{c.discount}% off</span>
                      </td>
                      <td className={TD}>
                        {c.type === "creator" ? (
                          <>
                            <span className="block font-medium text-ink">{c.creatorName}</span>
                            <span className="block text-xs text-faint">{[c.creatorHandle, c.commissionPercent ? `${c.commissionPercent}% commission` : ""].filter(Boolean).join(" · ") || "Creator"}</span>
                          </>
                        ) : <span className="text-sub">Everyone</span>}
                      </td>
                      <td className={TD}>
                        <div className="flex max-w-[260px] flex-wrap gap-1">
                          {rules.length
                            ? rules.map(r => <span key={r} className="rounded-md bg-[#f1f3f2] px-1.5 py-0.5 text-[11px] text-sub">{r}</span>)
                            : <span className="text-faint">None</span>}
                        </div>
                      </td>
                      <td className={cx(TD, "text-right")}>
                        {c.stats.orders > 0
                          ? <Link href={`/admin_console/orders?search=${encodeURIComponent(c.code)}`} className="font-medium text-pine no-underline hover:underline">{c.stats.orders.toLocaleString()}</Link>
                          : <span className="text-faint">0</span>}
                        <span className="block text-xs text-faint">
                          {c.stats.orders > 0 ? `${compact(c.stats.customers)} customer${c.stats.customers === 1 ? "" : "s"}` : ""}
                          {c.stats.cancelled > 0 ? `${c.stats.orders > 0 ? " · " : ""}${c.stats.cancelled} cancelled` : ""}
                        </span>
                      </td>
                      <td className={cx(TD, "whitespace-nowrap text-right")}>
                        {money(c.stats.sales)}
                        {c.stats.lastUsed && <span className="block text-xs text-faint">Last used {timeAgo(c.stats.lastUsed)}</span>}
                      </td>
                      <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>
                        {c.type === "creator" && c.commissionPercent > 0 ? money(commissionOf(c)) : <span className="font-normal text-faint">—</span>}
                      </td>
                      <td className={TD}><StatusBadge status={status.key}>{status.label}</StatusBadge></td>
                      <td className={cx(TD, "whitespace-nowrap text-right")}>
                        <IconButton label={c.active ? "Switch off" : "Switch on"} onClick={() => toggle(c)} className="h-8 w-8">
                          <Power size={15} aria-hidden />
                        </IconButton>
                        <IconButton label="Edit" onClick={() => startEdit(c)} className="h-8 w-8">
                          <Pencil size={15} aria-hidden />
                        </IconButton>
                        <IconButton label="Delete" onClick={() => remove(c)} className="h-8 w-8 hover:bg-[#fdeeee] hover:text-[#b91c1c]">
                          <Trash2 size={15} aria-hidden />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="m-0 px-1 text-xs text-faint">
        Orders, sales and commission leave out cancelled, returned and failed-payment orders. Sales are product value after the discount, without delivery.
      </p>
    </div>
  );
}
