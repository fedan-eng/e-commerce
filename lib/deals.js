// lib/deals.js — Black Friday flash deals (models/Deal.js) on the server.
// Deals only run inside the window in lib/blackFriday.js. Prices are applied by lib/pricing.js
// (so /api/paystack charges the deal price), and claims are counted when the order is paid.
import mongoose from "mongoose";
import Deal from "@/models/Deal";
import Order from "@/models/Order";
import { isBlackFridayLive } from "@/lib/blackFriday";

export const dealPrice = (price, percent) => Math.round((price * (100 - percent)) / 100);
const left = (deal) => Math.max(0, deal.quota - (deal.claimed || 0));

// Deals running now that still have units left. Needs an open DB connection.
export async function getLiveDeals(now = new Date()) {
  if (!isBlackFridayLive(now)) return [];
  const deals = await Deal.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return deals.filter((d) => left(d) > 0);
}

// { [productId]: deal } for the live deals
export function dealsByProduct(deals) {
  const map = new Map();
  for (const deal of deals) for (const id of deal.products || []) if (!map.has(String(id))) map.set(String(id), deal);
  return map;
}

// What the shopper sees for a deal on a product: { id, title, type, percent, gift, left }
export function dealSummary(deal) {
  return {
    id: String(deal._id),
    title: deal.title,
    type: deal.type,
    percent: deal.type === "discount" ? deal.percent : null,
    gift: deal.type === "gift" ? deal.gift : "",
    left: left(deal),
  };
}

/**
 * Applies live deals to priced cart lines ({ _id, price, quantity, ... }). A line with more
 * units than the deal has left is split: the deal units, then the rest at the normal price.
 * Each deal line gets `deal: { id, title, type, percent, gift, units }`.
 */
export function applyDeals(items, deals) {
  const byProduct = dealsByProduct(deals);
  const remaining = new Map(deals.map((d) => [String(d._id), left(d)]));
  const out = [];

  for (const item of items) {
    const deal = item.isBundle ? null : byProduct.get(String(item._id));
    const available = deal ? remaining.get(String(deal._id)) : 0;
    if (!deal || available <= 0) {
      out.push(item);
      continue;
    }

    const units = Math.min(item.quantity, available);
    remaining.set(String(deal._id), available - units);
    const info = { ...dealSummary(deal), units };
    delete info.left;

    const dealLine = { ...item, quantity: units, deal: info };
    if (deal.type === "discount") {
      dealLine.originalPrice = Math.max(item.originalPrice || 0, item.price);
      dealLine.price = dealPrice(item.price, deal.percent);
    }
    out.push(dealLine);
    if (item.quantity > units) out.push({ ...item, quantity: item.quantity - units });
  }
  return out;
}

// Adds a paid order's deal units to each deal's `claimed`. The order's dealsCounted flag is
// set first, so the webhook and verify-payment can't both count the same order.
export async function claimOrderDeals(orderId) {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, dealsCounted: { $ne: true }, paymentStatus: "paid", "items.deal.id": { $exists: true } },
      { $set: { dealsCounted: true } },
      { new: true }
    ).lean();
    if (!order) return;

    const units = new Map();
    for (const item of order.items || []) {
      const id = item.deal?.id;
      if (id && mongoose.isValidObjectId(id)) units.set(id, (units.get(id) || 0) + (Number(item.deal.units) || 0));
    }
    await Promise.all([...units].map(([id, n]) => Deal.updateOne({ _id: id }, { $inc: { claimed: n } })));
  } catch (err) {
    console.error(`claimOrderDeals(${orderId}) failed:`, err);
  }
}
