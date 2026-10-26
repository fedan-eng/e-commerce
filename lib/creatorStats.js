// lib/creatorStats.js — numbers for the admin Creators page and the creator rows on Promo codes.
//
// Who gets credit for an order: a creator code typed at checkout wins; otherwise the creator
// whose ?ref= link the shopper came through (Order.referralCode, kept for 30 days).
// Cancelled, returned and failed-payment orders don't count (same rule as lib/promoCodes.js).
import Order from "@/models/Order";
import ReferralEvent from "@/models/ReferralEvent";

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

// Orders credited to each creator (exported for tests)
export function ordersPipeline({ codes, from, to }) {
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
