// app/admin_console/deals/page.jsx
// Flash deals (models/Deal.js, lib/deals.js): "first N people" discounts and free
// gifts. Each deal shows how many units have gone; it stops by itself when the quota is reached.
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Power, Zap, Gift, Wand2, X } from "lucide-react";
import { PageHeader, Card, CardHeader, Button, IconButton, Field, Switch, EmptyState, Skeleton, inputCls, cx } from "@/components/admin/ui";
import { money } from "@/components/admin/format";
import { isBundleProduct } from "@/lib/bundles";
import { BLACK_FRIDAY_START, BLACK_FRIDAY_END, blackFridayPhase } from "@/lib/blackFriday";

const API = "/api/admin/deals";

const EMPTY_FORM = { title: "", type: "discount", percent: "35", gift: "", giftProduct: "", quota: "30", products: [], sortOrder: "0", claimed: "", active: true };

// The first flash deal list. `match` finds the products by name; check them before saving.
const DEAL_TEMPLATES = [
  { title: "Free cord with MagFlex",            type: "gift",     gift: "cord",             quota: 20, match: /magflex/i },
  { title: "Free cord with Thunder",            type: "gift",     gift: "cord",             quota: 20, match: /thunder/i },
  { title: "Free charger + cord with Spark Box", type: "gift",    gift: "charger and cord", quota: 10, match: /spark\s*box/i },
  { title: "35% off MagSafe",                   type: "discount", percent: 35,              quota: 30, match: /magsafe/i },
  { title: "35% off MagSnap",                   type: "discount", percent: 35,              quota: 30, match: /magsnap/i },
  { title: "50% off Pulse 3",                   type: "discount", percent: 50,              quota: 30, match: /pulse\s*3/i },
  { title: "50% off Odogwu Buds",               type: "discount", percent: 50,              quota: 30, match: /odogwu/i },
];

const fmtDate = (d) => d.toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });

function ProductPicker({ catalogue, selected, onChange }) {
  const [q, setQ] = useState("");
  const list = (catalogue || []).filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className={inputCls} aria-label="Search products" />
      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-edge">
        {catalogue === null && <p className="m-0 p-3 text-[13px] text-faint">Loading products…</p>}
        {list.map((p) => (
          <label key={p._id} className={cx("flex cursor-pointer items-center gap-2.5 border-b border-[#eef0ef] px-3 py-2 text-[13px] last:border-0", selected.includes(p._id) && "bg-pine-tint")}>
            <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} className="h-4 w-4 accent-pine" />
            <span className="flex-1 truncate">{p.name}</span>
            <span className="text-faint">{money(p.price)}</span>
          </label>
        ))}
      </div>
      <p className="m-0 mt-1.5 text-xs text-faint">{selected.length} selected. Several products share one quota.</p>
    </div>
  );
}

// The product given away with a gift deal; its photo shows in the popup, cart and order
function GiftProductPicker({ catalogue, value, onChange }) {
  const [q, setQ] = useState("");
  const list = (catalogue || []).filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const chosen = (catalogue || []).find((p) => p._id === value);
  return (
    <div>
      {chosen ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-pine bg-pine-tint px-3 py-2 text-[13px]">
          {chosen.image && <img src={chosen.image} alt="" className="h-8 w-8 rounded object-contain" />}
          <span className="flex-1 truncate font-medium">{chosen.name}</span>
          <button type="button" onClick={() => onChange("")} className="cursor-pointer text-xs font-semibold text-sub underline">Change</button>
        </div>
      ) : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for the free product (e.g. cord)" className={inputCls} aria-label="Search gift product" />
          <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-edge">
            {catalogue === null && <p className="m-0 p-3 text-[13px] text-faint">Loading products…</p>}
            {list.map((p) => (
              <button key={p._id} type="button" onClick={() => onChange(p._id)}
                className="flex w-full cursor-pointer items-center gap-2.5 border-b border-[#eef0ef] bg-white px-3 py-2 text-left text-[13px] last:border-0 hover:bg-pine-tint">
                {p.image ? <img src={p.image} alt="" className="h-7 w-7 rounded object-contain" /> : <span className="h-7 w-7" />}
                <span className="flex-1 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DealForm({ initial, catalogue, onSaved, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const isEdit = Boolean(initial._id);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `${API}/${initial._id}` : API, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Couldn't save the deal");
      toast.success(isEdit ? "Deal saved" : "Deal created");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title={isEdit ? "Edit deal" : "New deal"} action={<IconButton label="Close" onClick={onCancel}><X size={16} /></IconButton>} />
      <div className="grid grid-cols-1 gap-4 px-5 pb-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Field label="Title" hint="Shown in the popup and on the product page">
            <input value={form.title} onChange={set("title")} placeholder="35% off MagSnap" className={inputCls} />
          </Field>
          <Field label="Type">
            <div className="flex gap-1.5">
              {[{ v: "discount", l: "% off" }, { v: "gift", l: "Free gift" }].map((t) => (
                <button key={t.v} type="button" onClick={() => setForm((p) => ({ ...p, type: t.v }))} aria-pressed={form.type === t.v}
                  className={cx("h-8 cursor-pointer rounded-full border px-3 text-[13px] font-medium", form.type === t.v ? "border-pine bg-pine text-white" : "border-[#dfe3e1] bg-white text-sub")}>
                  {t.l}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {form.type === "discount" ? (
              <Field label="Discount (%)"><input type="number" min="1" max="90" value={form.percent} onChange={set("percent")} className={inputCls} /></Field>
            ) : (
              <Field label="Free gift (short name)"><input value={form.gift} onChange={set("gift")} placeholder="cord" className={inputCls} /></Field>
            )}
            <Field label="Quota (units)"><input type="number" min="1" value={form.quota} onChange={set("quota")} className={inputCls} /></Field>
            <Field label="Order in popup"><input type="number" value={form.sortOrder} onChange={set("sortOrder")} className={inputCls} /></Field>
            {isEdit && <Field label="Claimed so far"><input type="number" min="0" value={form.claimed} onChange={set("claimed")} className={inputCls} /></Field>}
          </div>
          {form.type === "gift" && (
            <Field label="Gift product" hint="The real product given away. Its photo shows in the popup, the cart and the order.">
              <GiftProductPicker catalogue={catalogue} value={form.giftProduct} onChange={(giftProduct) => setForm((p) => ({ ...p, giftProduct }))} />
            </Field>
          )}
          <Switch label="Active" description={form.active ? "Runs while the deal period is on" : "Paused"} checked={form.active} onChange={set("active")} />
        </div>
        <Field label="Products">
          <ProductPicker catalogue={catalogue} selected={form.products} onChange={(products) => setForm((p) => ({ ...p, products }))} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-edge px-5 py-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save deal" : "Create deal"}</Button>
      </div>
    </Card>
  );
}

function DealRow({ deal, onEdit, onToggle, onDelete }) {
  const pct = Math.min(100, Math.round(((deal.claimed || 0) / deal.quota) * 100));
  const soldOut = deal.claimed >= deal.quota;
  const Icon = deal.type === "gift" ? Gift : Zap;
  return (
    <li className="flex flex-col gap-3 border-b border-[#eef0ef] px-5 py-4 last:border-0 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-[#ffd95d]"><Icon size={18} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-ink">{deal.title}</span>
          {soldOut ? <span className="rounded-full bg-[#fdeeee] px-2 py-px text-xs font-semibold text-[#b91c1c]">Sold out</span>
            : !deal.active ? <span className="rounded-full bg-hover px-2 py-px text-xs font-semibold text-sub">Paused</span> : null}
        </div>
        <p className="m-0 mt-0.5 truncate text-xs text-faint">
          {(deal.products || []).map((p) => p?.name || "Deleted product").join(", ")}
          {deal.type === "gift" && (deal.giftProduct?.name ? ` · Gift: ${deal.giftProduct.name}` : " · No gift product picked")}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 max-w-[240px] flex-1 overflow-hidden rounded-full bg-[#e6e9e7]">
            <div className={cx("h-full rounded-full", soldOut ? "bg-[#b91c1c]" : "bg-pine")} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-sub">{deal.claimed || 0} / {deal.quota} claimed</span>
        </div>
      </div>
      <div className="flex gap-1">
        <IconButton label={deal.active ? "Pause" : "Resume"} onClick={onToggle}><Power size={16} /></IconButton>
        <IconButton label="Edit" onClick={onEdit}><Pencil size={16} /></IconButton>
        <IconButton label="Delete" onClick={onDelete}><Trash2 size={16} /></IconButton>
      </div>
    </li>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState(null);
  const [catalogue, setCatalogue] = useState(null);
  const [editing, setEditing] = useState(null); // form values, or null
  const [seeding, setSeeding] = useState(false);
  const phase = blackFridayPhase();

  const load = useCallback(() => {
    fetch(API).then((r) => r.json()).then((d) => setDeals(d.deals || [])).catch(() => { setDeals([]); toast.error("Couldn't load deals"); });
  }, []);

  useEffect(() => {
    load();
    fetch("/api/products?limit=500&sort=sortOrder.__all__")
      .then((r) => r.json())
      .then((d) => setCatalogue((d.products || []).filter((p) => !isBundleProduct(p)).map((p) => ({ _id: p._id, name: p.name, price: p.price, image: p.image || p.colors?.[0]?.images?.[0] || "" }))))
      .catch(() => setCatalogue([]));
  }, [load]);

  const editDeal = (d) => setEditing({
    _id: d._id, title: d.title, type: d.type, percent: String(d.percent || ""), gift: d.gift || "", giftProduct: d.giftProduct?._id ? String(d.giftProduct._id) : "", quota: String(d.quota),
    products: (d.products || []).filter(Boolean).map((p) => String(p._id)), sortOrder: String(d.sortOrder || 0), claimed: String(d.claimed || 0), active: d.active,
  });

  const toggle = async (d) => {
    const res = await fetch(`${API}/${d._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !d.active }) });
    if (res.ok) load(); else toast.error("Couldn't update the deal");
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete "${d.title}"? Orders that used it keep their deal price.`)) return;
    const res = await fetch(`${API}/${d._id}`, { method: "DELETE" });
    if (res.ok) load(); else toast.error("Couldn't delete the deal");
  };

  // Creates the deal list, matching products by name; skips titles that already exist
  const matches = useMemo(() => DEAL_TEMPLATES.map((t) => ({
    ...t, products: (catalogue || []).filter((p) => t.match.test(p.name)).map((p) => p._id),
  })), [catalogue]);

  const seed = async () => {
    const existing = new Set((deals || []).map((d) => d.title.toLowerCase()));
    const todo = matches.filter((t) => !existing.has(t.title.toLowerCase()));
    const missing = todo.filter((t) => t.products.length === 0).map((t) => t.title);
    if (!window.confirm(`Create ${todo.length - missing.length} deals?${missing.length ? `\n\nNo product found for: ${missing.join(", ")}. Add those by hand.` : ""}\n\nCheck each deal's products afterwards.`)) return;
    setSeeding(true);
    for (const [i, t] of todo.entries()) {
      if (!t.products.length) continue;
      const { match: _m, ...body } = t;
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, sortOrder: i }) });
      if (!res.ok) toast.error(`Couldn't create ${t.title}`);
    }
    setSeeding(false);
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Flash deals"
        description={`Deals run ${fmtDate(BLACK_FRIDAY_START)} – ${fmtDate(new Date(BLACK_FRIDAY_END - 60000))} (Lagos time). ${phase === "live" ? "Live now." : phase === "upcoming" ? "Not started yet." : "Finished."} Free delivery is off while they run.`}
        actions={
          <div className="flex gap-2">
            <Button onClick={seed} disabled={seeding || catalogue === null || deals === null}><Wand2 size={14} aria-hidden /> {seeding ? "Creating…" : "Set up deal list"}</Button>
            <Button variant="primary" onClick={() => setEditing({ ...EMPTY_FORM, sortOrder: String(deals?.length || 0) })}><Plus size={14} aria-hidden /> New deal</Button>
          </div>
        }
      />

      {editing && <DealForm key={editing._id || "new"} initial={editing} catalogue={catalogue} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <Card>
        {deals === null ? (
          <div className="flex flex-col gap-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : deals.length === 0 ? (
          <EmptyState icon={Zap} title="No deals yet" description="Use “Set up deal list” to create the seven deals, then check their products." />
        ) : (
          <ul className="m-0 list-none p-0">
            {deals.map((d) => <DealRow key={d._id} deal={d} onEdit={() => editDeal(d)} onToggle={() => toggle(d)} onDelete={() => remove(d)} />)}
          </ul>
        )}
      </Card>
    </div>
  );
}
