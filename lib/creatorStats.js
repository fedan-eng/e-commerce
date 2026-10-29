// lib/creatorStats.js — numbers for the admin Creators page, the creator rows on Promo codes and
// each creator's own dashboard (/creator).
//
// Who gets credit for an order: a creator code typed at checkout wins; otherwise the creator
// whose ?ref= link the shopper came through (Order.referralCode, kept for 30 days).
// Cancelled, returned and failed-payment orders don't count (same rule as lib/promoCodes.js).
import Order from "@/models/Order";
import ReferralEvent from "@/models/ReferralEvent";
import CreatorPayout from "@/models/CreatorPayout";
import { shortId } from "@/lib/orderStatus";

const TZ = "Africa/Lagos";

const NOT_A_SALE = {
  $or: [
    { $in: [{ $toLower: { $ifNull: ["$status", ""] } }, ["cancelled", "returned"]] },
    { $eq: ["$paymentStatus", "failed"] },
  ],
};

const upper = (field) => ({ $toUpper: { $ifNull: [field, ""] } });

function dateMatch(field, from, to) {
  if (!from && !to) return {};
  const range = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;
  return { [field]: range };
}

// Link visits and add-to-carts per creator (exported for tests)
export function eventsPipeline({ codes, from, to }) {
  return [
    { $match: { code: { $in: codes }, ...dateMatch("createdAt", from, to) } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: "$code",
              visits: { $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] } },
              visitors: { $addToSet: { $cond: [{ $eq: ["$type", "click"] }, "$visitorId", "$$REMOVE"] } },
              carters: { $addToSet: { $cond: [{ $eq: ["$type", "cart"] }, "$visitorId", "$$REMOVE"] } },
            },
          },
          { $project: { visits: 1, visitors: { $size: "$visitors" }, carts: { $size: "$carters" } } },
        ],
        daily: [
          { $match: { type: "click" } },
          { $group: { _id: { code: "$code", day: "$day" }, visits: { $sum: 1 } } },
        ],
        devices: [
          { $match: { type: "click" } },
          { $group: { _id: { code: "$code", device: "$device" }, n: { $sum: 1 } } },
        ],
      },
    },
  ];
}

// Picks each order's creator (`credit`) and whether it came through the link (`viaLink`)
function creditStages({ codes, from, to }) {
  return [
    { $match: { ...dateMatch("createdAt", from, to), $or: [{ promoCode: { $nin: [null, ""] } }, { referralCode: { $nin: [null, ""] } }] } },
    {
      $addFields: {
        _typed: upper("$promoCode"),
        _ref: upper("$referralCode"),
      },
    },
    {
      $addFields: {
        credit: { $cond: [{ $in: ["$_typed", codes] }, "$_typed", { $cond: [{ $in: ["$_ref", codes] }, "$_ref", null] }] },
        viaLink: { $and: [{ $not: [{ $in: ["$_typed", codes] }] }, { $in: ["$_ref", codes] }] },
        notSale: NOT_A_SALE,
      },
    },
    { $match: { credit: { $ne: null } } },
  ];
}

// Orders credited to each creator (exported for tests)
export function ordersPipeline({ codes, from, to }) {
  return [
    ...creditStages({ codes, from, to }),
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: "$credit",
              orders: { $sum: { $cond: ["$notSale", 0, 1] } },
              cancelled: { $sum: { $cond: ["$notSale", 1, 0] } },
              viaLink: { $sum: { $cond: [{ $and: ["$viaLink", { $not: ["$notSale"] }] }, 1, 0] } },
              sales: { $sum: { $cond: ["$notSale", 0, { $subtract: [{ $ifNull: ["$subTotal", 0] }, { $ifNull: ["$discount", 0] }] }] } },
              discount: { $sum: { $cond: ["$notSale", 0, { $ifNull: ["$discount", 0] }] } },
              customers: { $addToSet: { $cond: ["$notSale", "$$REMOVE", { $toLower: { $ifNull: ["$email", ""] } }] } },
              lastOrder: { $max: "$createdAt" },
            },
          },
        ],
        daily: [
          { $match: { notSale: false } },
          {
            $group: {
              _id: { code: "$credit", day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } } },
              orders: { $sum: 1 },
              sales: { $sum: { $subtract: [{ $ifNull: ["$subTotal", 0] }, { $ifNull: ["$discount", 0] }] } },
            },
          },
        ],
        products: [
          { $match: { notSale: false } },
          { $unwind: "$items" },
          {
            $group: {
              _id: { code: "$credit", name: "$items.name" },
              units: { $sum: { $ifNull: ["$items.quantity", 1] } },
            },
          },
          { $sort: { units: -1 } },
        ],
      },
    },
  ];
}

/**
 * codes: the creator codes (capitals). Returns
 * { byCode: { CODE: totals }, daily: [{ day, code, visits, orders, sales }], products: { CODE: [{ name, units }] },
 *   devices: { CODE: { mobile, tablet, desktop } } }
 */
export async function creatorAnalytics({ codes, from, to }) {
  if (!codes.length) return { byCode: {}, daily: [], products: {}, devices: {} };

  const [events, orders] = await Promise.all([
    ReferralEvent.aggregate(eventsPipeline({ codes, from, to })),
    Order.aggregate(ordersPipeline({ codes, from, to })),
  ]);

  const ev = events[0];
  const od = orders[0];
  const byCode = {};
  const blank = () => ({ visits: 0, visitors: 0, carts: 0, orders: 0, cancelled: 0, viaLink: 0, sales: 0, discount: 0, customers: 0, lastOrder: null });
  codes.forEach((c) => (byCode[c] = blank()));

  ev.totals.forEach(({ _id, ...t }) => Object.assign(byCode[_id], t));
  od.totals.forEach(({ _id, customers, ...t }) => Object.assign(byCode[_id], t, { customers: customers.filter(Boolean).length }));

  // One row per creator per day that had a visit or an order
  const dailyMap = new Map();
  const row = (code, day) => {
    const key = `${code}|${day}`;
    if (!dailyMap.has(key)) dailyMap.set(key, { code, day, visits: 0, orders: 0, sales: 0 });
    return dailyMap.get(key);
  };
  ev.daily.forEach(({ _id, visits }) => (row(_id.code, _id.day).visits = visits));
  od.daily.forEach(({ _id, orders: n, sales }) => Object.assign(row(_id.code, _id.day), { orders: n, sales }));

  const products = {};
  od.products.forEach(({ _id, units }) => {
    if (!_id.name) return;
    (products[_id.code] ||= []).length < 5 && products[_id.code].push({ name: _id.name, units });
  });

  const devices = {};
  ev.devices.forEach(({ _id, n }) => ((devices[_id.code] ||= { mobile: 0, tablet: 0, desktop: 0 })[_id.device || "desktop"] = n));

  return { byCode, daily: [...dailyMap.values()], products, devices };
}

// ─── A creator's own dashboard ────────────────────────────────

const round2 = (n) => Math.round(n * 100) / 100;
const lagosDay = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD

// Creators only ever see a buyer's first name
export const firstNameOnly = (v) => String(v || "").trim().split(/\s+/)[0] || "Customer";

// "void" = cancelled, returned or payment failed: earns nothing.
// "earned" = paid and delivered. Anything else is still "pending".
export function orderState(o) {
  const status = String(o.status || "").toLowerCase();
  const payment = o.paymentStatus || "paid";
  if (status === "cancelled" || status === "returned" || payment === "failed") return "void";
  return payment === "paid" && status === "delivered" ? "earned" : "pending";
}

/**
 * Turns the creator's credited orders (newest first) into what /creator shows (exported for tests).
 * rates: { CODE: current commission % }, used for orders placed before rates were saved on the order.
 * Balance and payouts are all-time; everything else follows from/to.
 */
export function buildCreatorDashboard(rows, { rates, payouts = [], from = null, to = null }) {
  const inRange = (d) => (!from || d >= from) && (!to || d <= to);
  let earnedAllTime = 0;
  let pendingAllTime = 0;

  const all = rows.map((o) => {
    const state = orderState(o);
    const sales = Math.max(0, (Number(o.subTotal) || 0) - (Number(o.discount) || 0));
    const saved = o.creatorCode === o.credit && o.commissionPercent != null;
    const rate = saved ? Number(o.commissionPercent) : rates[o.credit] || 0;
    const commission = state === "void" ? 0 : round2((sales * rate) / 100);
    if (state === "earned") earnedAllTime += commission;
    if (state === "pending") pendingAllTime += commission;
    return {
      id: String(o._id),
      ref: shortId(o._id),
      date: o.createdAt,
      code: o.credit,
      via: o.viaLink ? "link" : "code",
      customer: firstNameOnly(o.firstName),
      items: (o.items || []).map((i) => ({ name: i.name || "Item", quantity: Number(i.quantity) || 1, color: i.color || "" })),
      sales,
      discount: Number(o.discount) || 0,
      rate,
      commission,
      state,
      status: String(o.status || "confirmed").toLowerCase(),
      _email: String(o.email || "").toLowerCase(),
    };
  });

  const orders = all.filter((o) => inRange(new Date(o.date)));
  const counted = orders.filter((o) => o.state !== "void");

  // One person buying four things is one customer and one order
  const people = new Set(counted.map((o) => o._email || o.id));

  const daily = new Map();
  const products = new Map();
  counted.forEach((o) => {
    const day = lagosDay(o.date);
    const row = daily.get(day) || { day, orders: 0, commission: 0 };
    row.orders += 1;
    row.commission = round2(row.commission + o.commission);
    daily.set(day, row);
    o.items.forEach((i) => products.set(i.name, (products.get(i.name) || 0) + i.quantity));
  });

  const sum = (list, key) => round2(list.reduce((a, o) => a + o[key], 0));
  const paidOut = round2(payouts.reduce((a, p) => a + (Number(p.amount) || 0), 0));
  const earned = round2(earnedAllTime);

  return {
    summary: {
      customers: people.size,
      orders: counted.length,
      units: counted.reduce((a, o) => a + o.items.reduce((b, i) => b + i.quantity, 0), 0),
      sales: sum(counted, "sales"),
      discount: sum(counted, "discount"),
      earned: sum(orders.filter((o) => o.state === "earned"), "commission"),
      pending: sum(orders.filter((o) => o.state === "pending"), "commission"),
      cancelled: orders.length - counted.length,
    },
    balance: { earned, pending: round2(pendingAllTime), paidOut, owed: round2(earned - paidOut) },
    orders: orders.map(({ _email, ...o }) => o),
    daily: [...daily.values()].sort((a, b) => (a.day < b.day ? -1 : 1)),
    products: [...products].map(([name, units]) => ({ name, units })).sort((a, b) => b.units - a.units).slice(0, 5),
  };
}

/** rates: { CODE: commissionPercent } for the creator's codes (capitals). */
export async function creatorDashboard({ rates, from, to }) {
  const codes = Object.keys(rates);
  if (!codes.length) return { ...buildCreatorDashboard([], { rates }), payouts: [] };

  const [rows, payouts] = await Promise.all([
    Order.aggregate([
      ...creditStages({ codes }),
      { $sort: { createdAt: -1 } },
      {
        $project: {
          createdAt: 1, firstName: 1, email: 1, subTotal: 1, discount: 1, status: 1, paymentStatus: 1,
          credit: 1, viaLink: 1, creatorCode: 1, commissionPercent: 1,
          "items.name": 1, "items.quantity": 1, "items.color": 1,
        },
      },
    ]),
    CreatorPayout.find({ code: { $in: codes } }).sort({ paidAt: -1, _id: -1 }).lean(),
  ]);

  return {
    ...buildCreatorDashboard(rows, { rates, payouts, from, to }),
    payouts: payouts.map((p) => ({ id: String(p._id), code: p.code, amount: p.amount, paidAt: p.paidAt, note: p.note || "" })),
  };
}
