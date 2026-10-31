// lib/promoCodes.js — admin side of promo codes: input checks and per-code stats.
// Checkout rules live in lib/promo.js.
import Order from "@/models/Order";
import PromoCode from "@/models/PromoCode";

export const CODE_RE = /^[A-Z0-9_-]{3,30}$/;

const num = (v) => (v === "" || v == null ? NaN : Number(v));
const validDate = (v) => {
  if (!v || v === "null") return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

/**
 * Checks an add/edit form. Returns { data } ready to save, or { error }.
 * `code` is only read for new codes: renaming would split a code's history from its orders.
 */
export function parsePromoBody(body, { isNew }) {
  const data = {};

  if (isNew) {
    const code = String(body.code || "").trim().toUpperCase();
    if (!CODE_RE.test(code)) return { error: "Code must be 3–30 letters, numbers, - or _" };
    data.code = code;
  }

  const discount = num(body.discount);
  if (!Number.isFinite(discount) || discount < 1 || discount > 100) return { error: "Discount must be between 1 and 100%" };
  data.discount = Math.round(discount * 100) / 100;

  const minCartValue = body.minCartValue === "" || body.minCartValue == null ? 0 : num(body.minCartValue);
  if (!Number.isFinite(minCartValue) || minCartValue < 0) return { error: "Minimum cart value can't be negative" };
  data.minCartValue = minCartValue;

  const maxUses = body.maxUses === "" || body.maxUses == null ? 0 : num(body.maxUses);
  if (!Number.isInteger(maxUses) || maxUses < 0) return { error: "Usage limit must be a whole number (0 for no limit)" };
  data.maxUses = maxUses;

  if (body.expiresAt && !validDate(body.expiresAt)) return { error: "Expiry date isn't valid" };
  data.expiresAt = validDate(body.expiresAt);

  data.firstPurchaseOnly = Boolean(body.firstPurchaseOnly);
  data.oneTimePerUser = Boolean(body.oneTimePerUser);
  data.active = body.active !== false;
  data.note = String(body.note || "").trim().slice(0, 200);

  data.type = body.type === "creator" ? "creator" : "general";
  if (data.type === "creator") {
    data.creatorName = String(body.creatorName || "").trim().slice(0, 80);
    if (!data.creatorName) return { error: "Add the creator's name" };
    data.creatorHandle = String(body.creatorHandle || "").trim().slice(0, 80);
    const commission = body.commissionPercent === "" || body.commissionPercent == null ? 0 : num(body.commissionPercent);
    if (!Number.isFinite(commission) || commission < 0 || commission > 100) return { error: "Commission must be between 0 and 100%" };
    data.commissionPercent = commission;
  } else {
    data.creatorName = "";
    data.creatorHandle = "";
    data.commissionPercent = 0;
  }

  return { data };
}

// Older codes were saved by hand with text like "null" / "0" — normalise for the admin screen
export function toClient(p) {
  return {
    _id: String(p._id),
    code: p.code,
    discount: Number(p.discount) || 0,
    expiresAt: validDate(p.expiresAt),
    minCartValue: Number(p.minCartValue) || 0,
    maxUses: Number(p.maxUses) || 0,
    usedCount: Number(p.usedCount) || 0,
    firstPurchaseOnly: Boolean(p.firstPurchaseOnly),
    oneTimePerUser: Boolean(p.oneTimePerUser),
    active: p.active !== false,
    type: p.type === "creator" ? "creator" : "general",
    creatorName: p.creatorName || "",
    creatorHandle: p.creatorHandle || "",
    commissionPercent: Number(p.commissionPercent) || 0,
    note: p.note || "",
    createdAt: p.createdAt || null,
  };
}

// Cancelled, returned and failed-payment orders don't count as sales
const NOT_A_SALE = {
  $or: [
    { $in: [{ $toLower: { $ifNull: ["$status", ""] } }, ["cancelled", "returned"]] },
    { $eq: ["$paymentStatus", "failed"] },
  ],
};
const ifSale = (expr) => ({ $cond: [NOT_A_SALE, 0, expr] });

/**
 * Per-code numbers from the orders that used each code, optionally within a date range.
 * Returns { CODE: { orders, cancelled, sales, revenue, discount, customers, lastUsed } }.
 * sales = product value after the discount (no delivery) — what creator commission is paid on.
 */
export async function promoStats({ from, to } = {}) {
  const match = { promoCode: { $nin: [null, ""] } };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = from;
    if (to) match.createdAt.$lte = to;
  }

  const rows = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $toUpper: "$promoCode" },
        orders: { $sum: ifSale(1) },
        cancelled: { $sum: { $cond: [NOT_A_SALE, 1, 0] } },
        sales: { $sum: ifSale({ $subtract: [{ $ifNull: ["$subTotal", 0] }, { $ifNull: ["$discount", 0] }] }) },
        revenue: { $sum: ifSale({ $ifNull: ["$total", 0] }) },
        discount: { $sum: ifSale({ $ifNull: ["$discount", 0] }) },
        customers: { $addToSet: { $cond: [NOT_A_SALE, "$$REMOVE", { $toLower: { $ifNull: ["$email", ""] } }] } },
        lastUsed: { $max: "$createdAt" },
      },
    },
  ]);

  return Object.fromEntries(
    rows.map(({ _id, customers, ...r }) => [_id, { ...r, customers: customers.filter(Boolean).length }])
  );
}

export const EMPTY_STATS = { orders: 0, cancelled: 0, sales: 0, revenue: 0, discount: 0, customers: 0, lastUsed: null };

// A creator code that's switched on, or null. Used for ?ref= links and order credit.
// Cached briefly: link visits can come in bursts when a creator posts.
const creatorCache = new Map(); // CODE → { at, promo }
const CREATOR_CACHE_MS = 60 * 1000;

export async function findCreatorCode(raw) {
  const code = String(raw || "").trim().toUpperCase();
  if (!CODE_RE.test(code)) return null;
  const hit = creatorCache.get(code);
  if (hit && Date.now() - hit.at < CREATOR_CACHE_MS) return hit.promo;

  const doc = await PromoCode.findOne({ code, type: "creator", active: { $ne: false } })
    .collation({ locale: "en", strength: 2 })
    .select("code discount creatorName expiresAt")
    .lean();
  const expired = doc?.expiresAt && validDate(doc.expiresAt) && validDate(doc.expiresAt) < new Date();
  const promo = doc && !expired ? { code: doc.code.toUpperCase(), discount: Number(doc.discount) || 0, creatorName: doc.creatorName || "" } : null;

  if (creatorCache.size > 500) creatorCache.clear();
  creatorCache.set(code, { at: Date.now(), promo });
  return promo;
}
