// app/admin_console/creators/page.jsx
// Creator leaderboard: link visits → add-to-carts → orders, sales and commission per creator,
// with a day-by-day trend, top products and devices for whoever is selected.
// Codes are made on the Promo codes page (type: Creator); their link is /?ref=CODE.
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Chart, registerables } from "chart.js";
import {
  CalendarDays, ChevronDown, Copy, ExternalLink, MousePointerClick, ShoppingCart, ShoppingBag, Wallet, HandCoins,
  Megaphone, Smartphone, Monitor, Tablet, Plus,
} from "lucide-react";
import {
  PageHeader, Card, CardHeader, Button, IconButton, Dropdown, MenuItem, StatCard, EmptyState, Skeleton, Spinner,
  TH, TD, cx,
} from "@/components/admin/ui";
import { money, moneyShort, compact, timeAgo, initials } from "@/components/admin/format";

Chart.register(...registerables);

const PINE = "#0f472b";
const TOOLTIP = {
  backgroundColor: "#111814", titleColor: "#ffffff", bodyColor: "#e6e9e7",
  padding: 10, cornerRadius: 8, boxPadding: 4, titleFont: { weight: "500" },
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86400000;

const RANGES = [
  { value: "7d",        label: "Last 7 days" },
  { value: "30d",       label: "Last 30 days" },
  { value: "90d",       label: "Last 90 days" },
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
    case "90d":       return { from: new Date(today - 89 * DAY), to: null };
    case "thisMonth": return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null };
    case "lastMonth": return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, -1) };
    default:          return { from: null, to: null };
  }
}

const pad2 = n => String(n).padStart(2, "0");
const dayKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDay = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const pct = (a, b) => (b > 0 ? (a / b) * 100 : null);
const fmtPct = v => (v == null ? "—" : `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}%`);
const fmtCount = v => v.toLocaleString();
const refLink = code => `${typeof window !== "undefined" ? window.location.origin : "https://www.filstore.com.ng"}/?ref=${code}`;

async function copyLink(code) {
  try {
    await navigator.clipboard.writeText(refLink(code));
    toast.success(`${code} link copied`);
  } catch {
    toast.error("Couldn't copy. Select the link and copy it instead.");
  }
}

// Fun little titles, each to a single creator, only once there's enough to go on
function awardBadges(creators) {
  const badges = {};
  const give = (list, score, label, min = 1) => {
    const best = list.filter(c => score(c) >= min).sort((a, b) => score(b) - score(a))[0];
    if (best) (badges[best.code] ||= []).push(label);
  };
  give(creators, c => c.stats.sales, "💰 Top seller");
  give(creators, c => c.stats.visits, "🚀 Traffic magnet", 10);
  give(creators.filter(c => c.stats.visitors >= 20), c => c.stats.viaLink / c.stats.visitors, "🎯 Best converter", 0.0001);
  give(creators, c => c.stats.customers, "🤝 Most customers", 2);
  return badges;
}

const MEDALS = [
  { emoji: "🥇", ring: "ring-[#e8b730]", tint: "bg-[#fff8e1]" },
  { emoji: "🥈", ring: "ring-[#b9c2c9]", tint: "bg-[#f3f5f7]" },
  { emoji: "🥉", ring: "ring-[#d08a4f]", tint: "bg-[#fbf0e6]" },
];

// ─── Pieces ──────────────────────────────────────────────────
function CreatorAvatar({ name, size = "md" }) {
  const [first, last] = (name || "?").split(" ");
  return (
    <span className={cx(
      "flex shrink-0 items-center justify-center rounded-full bg-pine-tint font-semibold text-pine",
      size === "lg" ? "h-12 w-12 text-base" : "h-8 w-8 text-xs",
    )}>
      {initials(first, last)}
    </span>
  );
}

function Podium({ creators, selected, onSelect, badges }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {creators.slice(0, 3).map((c, i) => (
        <button
          key={c.code}
          type="button"
          onClick={() => onSelect(c.code)}
          aria-pressed={selected === c.code}
          className={cx(
            "relative flex cursor-pointer flex-col gap-3 rounded-xl border border-edge p-4 text-left transition-shadow hover:shadow-md",
            MEDALS[i].tint,
            selected === c.code && cx("ring-2", MEDALS[i].ring),
          )}
        >
          <span className="absolute right-3 top-3 text-2xl" aria-hidden>{MEDALS[i].emoji}</span>
          <div className="flex items-center gap-3 pr-8">
            <CreatorAvatar name={c.creatorName} size="lg" />
            <span className="min-w-0">
              <span className="block truncate font-poppins text-[15px] font-semibold text-ink">{c.creatorName}</span>
              <span className="block truncate text-xs text-faint">{c.creatorHandle || c.code}</span>
            </span>
          </div>
          <div>
            <span className="block font-poppins text-2xl font-semibold tracking-tight text-ink">{moneyShort(c.stats.sales)}</span>
            <span className="text-xs text-sub">
              {c.stats.orders} order{c.stats.orders === 1 ? "" : "s"} · {compact(c.stats.visits)} visit{c.stats.visits === 1 ? "" : "s"}
            </span>
          </div>
          {badges[c.code] && (
            <div className="flex flex-wrap gap-1">
              {badges[c.code].map(b => <span key={b} className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-ink">{b}</span>)}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function Funnel({ stats }) {
  const steps = [
    { label: "Visited through the link", value: stats.visitors, icon: MousePointerClick },
    { label: "Added to cart",            value: stats.carts,    icon: ShoppingCart },
    { label: "Ordered (through the link)", value: stats.viaLink, icon: ShoppingBag },
  ];
  const top = Math.max(steps[0].value, 1);
  return (
    <div className="flex flex-col gap-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const fromPrev = i > 0 ? pct(s.value, steps[i - 1].value) : null;
        return (
          <div key={s.label}>
            <div className="mb-1.5 flex items-center gap-2 text-[13px]">
              <Icon size={15} className="shrink-0 text-pine" aria-hidden />
              <span className="flex-1 text-sub">{s.label}</span>
              <b className="font-semibold text-ink">{s.value.toLocaleString()}</b>
              {i > 0 && <span className="w-14 text-right text-xs text-faint">{fmtPct(fromPrev)}</span>}
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#f1f3f2]">
              <div
                className="h-full rounded-full bg-pine transition-[width] duration-500"
                style={{ width: `${s.value ? Math.max(3, (s.value / top) * 100) : 0}%`, opacity: 1 - i * 0.22 }}
              />
            </div>
          </div>
        );
      })}
      <p className="m-0 text-xs text-faint">
        Percentages are from the step above. {stats.orders - stats.viaLink > 0 &&
          `Plus ${stats.orders - stats.viaLink} order${stats.orders - stats.viaLink === 1 ? "" : "s"} where the code was typed at checkout.`}
      </p>
    </div>
  );
}

function MiniBars({ rows, empty }) {
  const max = Math.max(...rows.map(r => r.value), 1);
  if (!rows.some(r => r.value)) return <p className="m-0 py-6 text-center text-[13px] text-faint">{empty}</p>;
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {rows.map(r => (
        <li key={r.label}>
          <div className="mb-1 flex items-center gap-2 text-[13px]">
            {r.icon && <r.icon size={14} className="shrink-0 text-faint" aria-hidden />}
            <span className="min-w-0 flex-1 truncate text-ink">{r.label}</span>
            <span className="shrink-0 text-sub">{r.text ?? r.value.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#f1f3f2]">
            <div className="h-full rounded-full bg-pine" style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TrendChart({ type, labels, data, label, format }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, ref.current.clientHeight || 200);
    grad.addColorStop(0, "rgba(15,71,43,0.16)");
    grad.addColorStop(1, "rgba(15,71,43,0)");
    const chart = new Chart(ref.current, {
      type,
      data: {
        labels,
        datasets: [type === "line"
          ? { label, data, borderColor: PINE, backgroundColor: grad, borderWidth: 2, fill: true, tension: 0.35,
              pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: PINE, pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2 }
          : { label, data, backgroundColor: PINE, borderRadius: 4, maxBarThickness: 18 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: c => ` ${label}: ${format(c.raw)}` } } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#7a847f", font: { size: 11 }, maxRotation: 0, autoSkipPadding: 16 } },
          y: { grid: { color: "#eef0ef" }, border: { display: false }, beginAtZero: true, ticks: { color: "#7a847f", font: { size: 11 }, maxTicksLimit: 4, precision: 0 } },
        },
      },
    });
    return () => chart.destroy();
  }, [type, labels, data, label, format]);
  return <canvas ref={ref} role="img" aria-label={`${label} per day`} />;
}

// ─── Page ─────────────────────────────────────────────────────
export default function CreatorsPage() {
  const [range,    setRange]    = useState("30d");
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = rangeBounds(range);
    const params = new URLSearchParams();
    if (from) params.set("from", from.toISOString());
    if (to) params.set("to", to.toISOString());
    try {
      const res = await fetch(`/api/admin/creators?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Couldn't load creator stats");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const creators = useMemo(
    () => [...(data?.creators || [])].sort((a, b) => b.stats.sales - a.stats.sales || b.stats.orders - a.stats.orders || b.stats.visits - a.stats.visits),
    [data],
  );
  const badges = useMemo(() => awardBadges(creators), [creators]);
  const focus = creators.find(c => c.code === selected) || null;
  const rangeLabel = RANGES.find(r => r.value === range).label;

  // Everything below the leaderboard follows the selection ("all" adds every creator up)
  const scope = focus ? [focus] : creators;
  const total = key => scope.reduce((a, c) => a + c.stats[key], 0);
  const scoped = {
    visits: total("visits"), visitors: total("visitors"), carts: total("carts"),
    orders: total("orders"), viaLink: total("viaLink"), sales: total("sales"), commission: total("commission"),
  };

  // Day-by-day series across the range (or from the first activity, for "All time")
  const series = useMemo(() => {
    const rows = (data?.daily || []).filter(r => !focus || r.code === focus.code);
    const { from, to } = rangeBounds(range);
    const firstDay = rows.reduce((min, r) => (r.day < min ? r.day : min), dayKey(new Date()));
    const start = from ? startOfDay(from) : parseDay(firstDay);
    const end = startOfDay(to || new Date());
    const index = {};
    const labels = [], visits = [], orders = [];
    for (let d = start, i = 0; d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), i++) {
      index[dayKey(d)] = i;
      labels.push(`${d.getDate()} ${MONTHS[d.getMonth()]}`);
      visits.push(0);
      orders.push(0);
    }
    rows.forEach(r => {
      const i = index[r.day];
      if (i === undefined) return;
      visits[i] += r.visits;
      orders[i] += r.orders;
    });
    return { labels, visits, orders };
  }, [data, focus, range]);

  const productUnits = {};
  scope.forEach(c => c.products.forEach(p => { productUnits[p.name] = (productUnits[p.name] || 0) + p.units; }));
  const products = Object.entries(productUnits).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([label, value]) => ({ label, value, text: `${value} unit${value === 1 ? "" : "s"}` }));

  const devices = ["mobile", "desktop", "tablet"].map(d => {
    const value = scope.reduce((a, c) => a + (c.devices[d] || 0), 0);
    return { label: d[0].toUpperCase() + d.slice(1), value, icon: { mobile: Smartphone, desktop: Monitor, tablet: Tablet }[d] };
  });
  const deviceTotal = devices.reduce((a, d) => a + d.value, 0);
  devices.forEach(d => { d.text = `${d.value.toLocaleString()} · ${fmtPct(pct(d.value, deviceTotal))}`; });

  const statCards = [
    { label: "Link visits",     value: scoped.visits.toLocaleString(), icon: MousePointerClick, note: `${scoped.visitors.toLocaleString()} different people` },
    { label: "Orders",          value: scoped.orders.toLocaleString(), icon: ShoppingBag,       note: `${fmtPct(pct(scoped.viaLink, scoped.visitors))} of visitors ordered` },
    { label: "Sales",           value: money(scoped.sales),            icon: Wallet,            note: scoped.orders ? `${money(scoped.sales / scoped.orders)} per order` : rangeLabel },
    { label: "Commission owed", value: money(scoped.commission),       icon: HandCoins,         note: rangeLabel },
  ];

  const header = (
    <PageHeader
      title="Creators"
      description={`Who's bringing in buyers: link visits, carts and orders. ${rangeLabel}.`}
      actions={
        <>
          <Dropdown
            renderTrigger={({ open, toggle }) => (
              <Button onClick={toggle} aria-expanded={open}>
                <CalendarDays size={16} aria-hidden /> {rangeLabel} <ChevronDown size={14} aria-hidden />
              </Button>
            )}
          >
            {RANGES.map(r => <MenuItem key={r.value} selected={range === r.value} onClick={() => setRange(r.value)}>{r.label}</MenuItem>)}
          </Dropdown>
          <Button variant="primary" href="/admin_console/promo-codes"><Plus size={16} aria-hidden /> New creator code</Button>
        </>
      }
    />
  );

  if (!loading && creators.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <Card>
          <EmptyState
            icon={Megaphone}
            title="No creators yet"
            description="Create a promo code with the type set to Creator. You'll get a link to share, and every visit, cart and order it brings shows up here."
            action={<Button variant="primary" href="/admin_console/promo-codes"><Plus size={16} aria-hidden /> New creator code</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {header}

      {/* Leaderboard */}
      <Card>
        <CardHeader
          title="Leaderboard"
          description="Ranked by sales. Click a creator to see their funnel and trends below."
          action={selected !== "all" && <Button variant="ghost" size="sm" onClick={() => setSelected("all")}>Show all creators</Button>}
        />
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          {loading
            ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-[168px] rounded-xl" />)}</div>
            : <Podium creators={creators} selected={selected} onSelect={setSelected} badges={badges} />}
        </div>

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className={cx(TH, "w-10")}>#</th>
                  <th className={TH}>Creator</th>
                  <th className={cx(TH, "text-right")}>Visits</th>
                  <th className={cx(TH, "text-right")}>Carts</th>
                  <th className={cx(TH, "text-right")}>Orders</th>
                  <th className={TH}>Conversion</th>
                  <th className={cx(TH, "text-right")}>Sales</th>
                  <th className={cx(TH, "text-right")}>Commission</th>
                  <th className={TH}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {creators.map((c, i) => {
                  const conv = pct(c.stats.viaLink, c.stats.visitors);
                  return (
                    <tr
                      key={c.code}
                      onClick={() => setSelected(c.code)}
                      className={cx("cursor-pointer hover:bg-[#fafbfa]", selected === c.code && "bg-pine-tint")}
                    >
                      <td className={cx(TD, "text-faint")}>{i < 3 && c.stats.sales > 0 ? MEDALS[i].emoji : i + 1}</td>
                      <td className={TD}>
                        <div className="flex items-center gap-2.5">
                          <CreatorAvatar name={c.creatorName} />
                          <span className="min-w-0">
                            <span className="block font-medium text-ink">
                              {c.creatorName}
                              {!c.active && <span className="ml-1.5 rounded bg-[#f1f3f2] px-1.5 py-px text-[10px] font-medium text-faint">Off</span>}
                            </span>
                            <span className="block text-xs text-faint">
                              <span className="font-mono">{c.code}</span>{c.creatorHandle && ` · ${c.creatorHandle}`}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className={cx(TD, "text-right")}>{c.stats.visits.toLocaleString()}</td>
                      <td className={cx(TD, "text-right")}>{c.stats.carts.toLocaleString()}</td>
                      <td className={cx(TD, "text-right")}>
                        {c.stats.orders > 0
                          ? <Link href={`/admin_console/orders?search=${encodeURIComponent(c.code)}`} onClick={e => e.stopPropagation()} className="font-medium text-pine no-underline hover:underline">{c.stats.orders}</Link>
                          : <span className="text-faint">0</span>}
                        {c.stats.lastOrder && <span className="block text-xs text-faint">{timeAgo(c.stats.lastOrder)}</span>}
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#f1f3f2]">
                            <div className="h-full rounded-full bg-pine" style={{ width: `${Math.min(100, (conv || 0) * 5)}%` }} />
                          </div>
                          <span className="text-sub">{fmtPct(conv)}</span>
                        </div>
                      </td>
                      <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>{money(c.stats.sales)}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right")}>
                        {c.commissionPercent > 0 ? money(c.stats.commission) : <span className="text-faint">—</span>}
                        {c.commissionPercent > 0 && <span className="block text-xs text-faint">{c.commissionPercent}%</span>}
                      </td>
                      <td className={cx(TD, "whitespace-nowrap text-right")} onClick={e => e.stopPropagation()}>
                        <IconButton label={`Copy ${c.code} link`} onClick={() => copyLink(c.code)} className="h-8 w-8">
                          <Copy size={15} aria-hidden />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="m-0 border-t border-edge px-5 py-3 text-xs text-faint">
              Conversion = people who ordered through the link ÷ people who visited through it. The bar is full at 20%.
            </p>
          </div>
        )}
      </Card>

      {/* Totals for the selection */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-sub">Showing</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-pine px-3 py-1 text-[13px] font-medium text-white">
          {focus ? focus.creatorName : "All creators"}
        </span>
        {focus && (
          <>
            <button
              type="button"
              onClick={() => copyLink(focus.code)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-edge bg-white px-3 py-1 font-mono text-[12px] text-sub hover:border-pine hover:text-pine"
            >
              <Copy size={13} aria-hidden /> {refLink(focus.code).replace(/^https?:\/\//, "")}
            </button>
            <a href={refLink(focus.code)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-pine no-underline hover:underline">
              Try it <ExternalLink size={13} aria-hidden />
            </a>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* Trends: one measure per chart */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Link visits per day" description={`${scoped.visits.toLocaleString()} in total`} />
          <div className="h-[220px] px-4 pb-4">
            {loading ? <div className="flex h-full items-center justify-center"><Spinner /></div>
              : <TrendChart type="line" labels={series.labels} data={series.visits} label="Visits" format={fmtCount} />}
          </div>
        </Card>
        <Card>
          <CardHeader title="Orders per day" description={`${scoped.orders.toLocaleString()} in total, link and typed code`} />
          <div className="h-[220px] px-4 pb-4">
            {loading ? <div className="flex h-full items-center justify-center"><Spinner /></div>
              : <TrendChart type="bar" labels={series.labels} data={series.orders} label="Orders" format={fmtCount} />}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Funnel" description="From tapping the link to paying" />
          <div className="px-5 pb-5">{loading ? <Skeleton className="h-32 w-full" /> : <Funnel stats={scoped} />}</div>
        </Card>
        <Card>
          <CardHeader title="What their buyers bought" />
          <div className="px-5 pb-5">{loading ? <Skeleton className="h-32 w-full" /> : <MiniBars rows={products} empty="No orders in this period yet" />}</div>
        </Card>
        <Card>
          <CardHeader title="Devices" description="Where link visitors opened it" />
          <div className="px-5 pb-5">{loading ? <Skeleton className="h-32 w-full" /> : <MiniBars rows={devices} empty="No link visits in this period yet" />}</div>
        </Card>
      </div>

      <p className="m-0 px-1 text-xs text-faint">
        A visit is one person opening a creator&apos;s link on a given day. An order counts for a creator when their code was typed at
        checkout, or when the shopper came through their link in the 30 days before (a typed code wins). Cancelled, returned and
        failed-payment orders are left out. Sales are product value after the discount, without delivery.
      </p>
    </div>
  );
}
