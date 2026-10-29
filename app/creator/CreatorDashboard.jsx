// app/creator/CreatorDashboard.jsx
// What a creator sees: people who bought with their code or link, every order (buyer's first name,
// what they bought, the code and discount, and the commission), earnings so far and payouts.
// Numbers come from /api/creator/dashboard (lib/creatorStats.js).
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Chart, registerables } from "chart.js";
import {
  CalendarDays, ChevronDown, Copy, Users, ShoppingBag, HandCoins, Wallet, Megaphone, Link2, TicketPercent, ShieldCheck,
} from "lucide-react";
import {
  Card, CardHeader, Button, Dropdown, MenuItem, StatCard, StatusBadge, EmptyState, Skeleton, Spinner, TH, TD, cx,
} from "@/components/admin/ui";
import { money, moneyShort } from "@/components/admin/format";

Chart.register(...registerables);

const PINE = "#0f472b";
const DAY = 86400000;
const PAGE = 20;

const RANGES = [
  { value: "30d",       label: "Last 30 days" },
  { value: "7d",        label: "Last 7 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "all",       label: "All time" },
];

const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function rangeBounds(value) {
  const now = new Date();
  const today = startOfDay(now);
  switch (value) {
    case "7d":        return { from: new Date(today - 6 * DAY), to: null };
    case "30d":       return { from: new Date(today - 29 * DAY), to: null };
    case "thisMonth": return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null };
    case "lastMonth": return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, -1) };
    default:          return { from: null, to: null };
  }
}

const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtDay = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };
const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
const refLink = code => `${typeof window !== "undefined" ? window.location.origin : "https://www.filstore.com.ng"}/?ref=${code}`;

async function copy(text, done) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done);
  } catch {
    toast.error("Couldn't copy. Select it and copy it instead.");
  }
}

const COMMISSION_STATE = {
  earned:  { label: "Earned",       cls: "text-pine" },
  pending: { label: "Pending",      cls: "text-[#a16207]" },
  void:    { label: "Doesn't count", cls: "text-faint" },
};

// ─── Pieces ──────────────────────────────────────────────────
function CommissionChart({ daily }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: daily.map(d => fmtDay(d.day)),
        datasets: [{ label: "Commission", data: daily.map(d => d.commission), backgroundColor: PINE, borderRadius: 4, maxBarThickness: 22 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111814", padding: 10, cornerRadius: 8,
            callbacks: { label: c => ` ${money(c.raw)} · ${plural(daily[c.dataIndex].orders, "order")}` },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#7a847f", font: { size: 11 }, maxRotation: 0, autoSkipPadding: 16 } },
          y: { grid: { color: "#eef0ef" }, border: { display: false }, beginAtZero: true, ticks: { color: "#7a847f", font: { size: 11 }, maxTicksLimit: 4, callback: moneyShort } },
        },
      },
    });
    return () => chart.destroy();
  }, [daily]);
  return <canvas ref={ref} role="img" aria-label="Commission per day" />;
}

function CodeCard({ c }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-edge bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold tracking-wide text-ink">{c.code}</span>
            {!c.active && <span className="rounded bg-[#f1f3f2] px-1.5 py-px text-[11px] font-medium text-faint">Paused</span>}
          </div>
          <p className="m-0 mt-0.5 text-xs text-sub">
            Buyers get {c.discount}% off · you earn {c.commissionPercent}% of what they pay for products
          </p>
        </div>
        <TicketPercent size={20} className="shrink-0 text-pine" aria-hidden />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => copy(c.code, `${c.code} copied`)}><Copy size={14} aria-hidden /> Copy code</Button>
        <Button size="sm" onClick={() => copy(refLink(c.code), "Link copied")}><Link2 size={14} aria-hidden /> Copy link</Button>
      </div>
    </div>
  );
}

function Bought({ items }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {items.map((i, n) => (
        <li key={n} className="text-[13px] text-ink">
          {i.quantity > 1 && <span className="font-medium">{i.quantity} × </span>}{i.name}
          {i.color && <span className="text-faint"> · {i.color}</span>}
        </li>
      ))}
    </ul>
  );
}

function CodeUsed({ o }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-mono text-[12px] font-medium text-ink">{o.code}</span>
      <span className="block text-xs text-faint">{o.via === "link" ? "Came through your link" : "Typed the code"}</span>
    </span>
  );
}

function Commission({ o }) {
  const s = COMMISSION_STATE[o.state];
  return (
    <span className="whitespace-nowrap text-right">
      <span className={cx("block font-medium", s.cls)}>{money(o.commission)}</span>
      <span className="block text-xs text-faint">{s.label}{o.state !== "void" && ` · ${o.rate}%`}</span>
    </span>
  );
}

function OrdersList({ orders }) {
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [orders]);
  const visible = orders.slice(0, shown);

  return (
    <>
      {/* Phones: one card per order */}
      <ul className="m-0 flex list-none flex-col p-0 md:hidden">
        {visible.map(o => (
          <li key={o.id} className="flex flex-col gap-2.5 border-t border-[#eef0ef] px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-ink">{o.customer}</div>
                <div className="text-xs text-faint">{fmtDate(o.date)} · #{o.ref}</div>
              </div>
              <Commission o={o} />
            </div>
            <Bought items={o.items} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CodeUsed o={o} />
              <StatusBadge status={o.status} />
            </div>
            <div className="flex justify-between text-xs text-sub">
              <span>Order value {money(o.sales)}</span>
              <span>{o.discount > 0 ? `They saved ${money(o.discount)}` : "No discount"}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Wider screens: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className={TH}>Date</th>
              <th className={TH}>Customer</th>
              <th className={TH}>What they bought</th>
              <th className={TH}>Code</th>
              <th className={cx(TH, "text-right")}>Discount</th>
              <th className={cx(TH, "text-right")}>Order value</th>
              <th className={cx(TH, "text-right")}>Your commission</th>
              <th className={TH}>Delivery</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(o => (
              <tr key={o.id} className="align-top hover:bg-[#fafbfa]">
                <td className={cx(TD, "whitespace-nowrap align-top text-sub")}>{fmtDate(o.date)}<span className="block text-xs text-faint">#{o.ref}</span></td>
                <td className={cx(TD, "align-top font-medium")}>{o.customer}</td>
                <td className={cx(TD, "align-top")}><Bought items={o.items} /></td>
                <td className={cx(TD, "align-top")}><CodeUsed o={o} /></td>
                <td className={cx(TD, "whitespace-nowrap text-right align-top text-sub")}>{o.discount > 0 ? money(o.discount) : "—"}</td>
                <td className={cx(TD, "whitespace-nowrap text-right align-top")}>{money(o.sales)}</td>
                <td className={cx(TD, "align-top")}><Commission o={o} /></td>
                <td className={cx(TD, "align-top")}><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length > shown && (
        <div className="flex justify-center border-t border-edge p-3">
          <Button variant="ghost" onClick={() => setShown(n => n + PAGE)}>Show more ({orders.length - shown} left)</Button>
        </div>
      )}
    </>
  );
}

function Blocked({ title, description, action }) {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-16">
      <Card><EmptyState icon={Megaphone} title={title} description={description} action={action} /></Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function CreatorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewCode = searchParams.get("code") || "";
  const [range,   setRange]   = useState("30d");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(null); // { status, message }

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = rangeBounds(range);
    const params = new URLSearchParams();
    if (from) params.set("from", from.toISOString());
    if (to) params.set("to", to.toISOString());
    if (viewCode) params.set("code", viewCode);
    try {
      const res = await fetch(`/api/creator/dashboard?${params}`, { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) return router.replace(`/login?callbackUrl=${encodeURIComponent("/creator" + (viewCode ? `?code=${viewCode}` : ""))}`);
      if (!res.ok) return setBlocked({ status: res.status, message: body.message });
      setBlocked(null);
      setData(body);
    } catch {
      toast.error("Couldn't load your dashboard");
    } finally {
      setLoading(false);
    }
  }, [range, viewCode, router]);

  useEffect(() => { load(); }, [load]);

  const rangeLabel = RANGES.find(r => r.value === range).label;

  // Fill in the days with nothing so the chart reads as a timeline
  const daily = useMemo(() => {
    if (!data?.daily?.length) return [];
    const byDay = Object.fromEntries(data.daily.map(d => [d.day, d]));
    const { from, to } = rangeBounds(range);
    const [y, m, d] = data.daily[0].day.split("-").map(Number);
    const start = from ? startOfDay(from) : new Date(y, m - 1, d);
    const end = startOfDay(to || new Date());
    const out = [];
    for (let day = start; day <= end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
      const key = day.toLocaleDateString("en-CA");
      out.push(byDay[key] || { day: key, orders: 0, commission: 0 });
    }
    return out;
  }, [data, range]);

  if (blocked) {
    if (blocked.status === 403) {
      return (
        <Blocked
          title="This page is for FIL creators"
          description="If you share FIL with your audience and should have a creator dashboard, message us and we'll set it up."
          action={<Button variant="primary" href="/contact">Contact us</Button>}
        />
      );
    }
    return (
      <Blocked
        title="Pick a creator"
        description={blocked.message || "Something went wrong."}
        action={<Button variant="primary" href="/admin_console/creators">Go to Creators</Button>}
      />
    );
  }

  if (!data) return <div className="flex justify-center py-24"><Spinner /></div>;

  const { creator, summary, balance, orders, products, payouts, asAdmin } = data;

  if (!creator.codes.length) {
    return (
      <Blocked
        title="Your code isn't set up yet"
        description="Your creator account is ready, but no code is linked to it yet. We'll let you know as soon as it is."
        action={<Button href="/contact">Contact us</Button>}
      />
    );
  }

  const stats = [
    { label: "Customers", value: summary.customers.toLocaleString(), icon: Users, note: `${plural(summary.orders, "order")} · ${rangeLabel.toLowerCase()}` },
    { label: "Sales you brought", value: money(summary.sales), icon: ShoppingBag, note: `${plural(summary.units, "item")} bought` },
    { label: "Commission earned", value: money(summary.earned), icon: HandCoins, note: summary.pending > 0 ? `+ ${money(summary.pending)} pending delivery` : "Paid and delivered orders" },
    { label: "Owed to you", value: money(balance.owed), icon: Wallet, note: `${money(balance.paidOut)} paid out so far` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-6 font-roboto text-ink sm:px-6 sm:py-8">
      {asAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-[#f5d48a] bg-[#fff8e1] px-4 py-2.5 text-[13px] text-[#7a5a00]">
          <ShieldCheck size={16} aria-hidden /> You&apos;re seeing {creator.name || "this creator"}&apos;s dashboard as an admin.
          <Link href="/admin_console/creators" className="ml-auto font-medium text-[#7a5a00]">Back to Creators</Link>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="m-0 font-poppins text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
            {asAdmin ? creator.name : `Hi ${creator.name.split(" ")[0] || "there"}`}
          </h1>
          <p className="m-0 mt-1 text-[13px] text-faint">
            {creator.handle ? `${creator.handle} · ` : ""}Everyone who bought with your code or through your link.
          </p>
        </div>
        <Dropdown
          renderTrigger={({ open, toggle }) => (
            <Button onClick={toggle} aria-expanded={open}>
              <CalendarDays size={16} aria-hidden /> {rangeLabel} <ChevronDown size={14} aria-hidden />
            </Button>
          )}
        >
          {RANGES.map(r => <MenuItem key={r.value} selected={range === r.value} onClick={() => setRange(r.value)}>{r.label}</MenuItem>)}
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {creator.codes.map(c => <CodeCard key={c.code} c={c} />)}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title="Commission per day" description={`${money(summary.earned + summary.pending)} from ${plural(summary.orders, "order")}, earned and pending`} />
          <div className="h-[220px] px-4 pb-4">
            {loading ? <Skeleton className="h-full w-full" />
              : daily.length ? <CommissionChart daily={daily} />
              : <p className="m-0 flex h-full items-center justify-center text-[13px] text-faint">No orders in this period yet</p>}
          </div>
        </Card>
        <Card>
          <CardHeader title="What your buyers bought" />
          <div className="px-5 pb-5">
            {loading ? <Skeleton className="h-32 w-full" /> : products.length === 0
              ? <p className="m-0 py-6 text-center text-[13px] text-faint">Nothing yet</p>
              : (
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {products.map(p => (
                    <li key={p.name}>
                      <div className="mb-1 flex gap-2 text-[13px]">
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <span className="shrink-0 text-sub">{plural(p.units, "unit")}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#f1f3f2]">
                        <div className="h-full rounded-full bg-pine" style={{ width: `${Math.max(3, (p.units / products[0].units) * 100)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Orders"
          description={`${plural(summary.orders, "order")} from ${plural(summary.customers, "customer")}${summary.cancelled ? ` · ${summary.cancelled} cancelled or returned` : ""}`}
        />
        {loading ? <div className="px-5 pb-5"><Skeleton className="h-40 w-full" /></div>
          : orders.length === 0
            ? <EmptyState icon={ShoppingBag} title="No orders in this period" description="Share your code or link. Every order it brings shows up here." />
            : <OrdersList orders={orders} />}
      </Card>

      <Card>
        <CardHeader title="Payouts" description={`${money(balance.earned)} earned all time · ${money(balance.paidOut)} paid out · ${money(balance.owed)} owed`} />
        {payouts.length === 0 ? (
          <p className="m-0 px-5 pb-5 text-[13px] text-faint">No payouts yet. They&apos;ll show here once we send your commission.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {payouts.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-3 border-t border-[#eef0ef] px-5 py-3 text-[13px]">
                <span className="min-w-0">
                  <span className="block text-ink">{fmtDate(p.paidAt)}</span>
                  {p.note && <span className="block truncate text-xs text-faint">{p.note}</span>}
                </span>
                <span className="shrink-0 font-medium">{money(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="m-0 px-1 text-xs leading-relaxed text-faint">
        An order is yours when your code was typed at checkout, or when the buyer came through your link in the 30 days before.
        One customer buying several items counts as one customer and one order. Commission is a percentage of what they paid for
        products after the discount, without delivery. It&apos;s earned once the order is paid and delivered; until then it&apos;s
        pending. Cancelled and returned orders don&apos;t count.
      </p>
    </div>
  );
}
