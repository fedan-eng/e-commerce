// lib/promo.js — promo code rules, shared by /api/promocode (applying a code) and /api/paystack
// (where the discount is worked out again, so the browser can't choose its own).
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import Order from "@/models/Order";
import User from "@/models/User";

// The signed-in user's id from the session cookie, never from the request body
export async function sessionUserId() {
  const token = (await cookies()).get("token")?.value;
  return token ? verifyToken(token)?.id || null : null;
}

/**
 * Checks a promo code for this shopper and cart. Returns
 * { valid: true, code, percent, amount } or { valid: false, status, message, requiresLogin? }.
 * Needs an open DB connection.
 */
export async function validatePromo({ code, userId, cartValue }) {
  const normalized = String(code || "").trim().toUpperCase();
  const fail = (message, status = 400, extra = {}) => ({ valid: false, status, message, ...extra });

  const promo = normalized
    ? await PromoCode.findOne({ code: normalized }).collation({ locale: "en", strength: 2 })
    : null;
  if (!promo) return fail("Invalid promo code");

  // First-order and once-per-person codes need to know who's buying
  if ((promo.firstPurchaseOnly || promo.oneTimePerUser) && !userId) {
    return fail("Please log in to use this promo code", 401, { requiresLogin: true });
  }

  const user = userId ? await User.findById(userId).select("email") : null;
  if (userId && !user) return fail("Please log in again to use this promo code", 401, { requiresLogin: true });

  if (promo.expiresAt && promo.expiresAt < new Date()) return fail("Promo code has expired");

  if (cartValue < promo.minCartValue) {
    return fail(`Minimum cart value of ₦${promo.minCartValue.toLocaleString()} required`);
  }

  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return fail("Promo usage limit reached");

  // Orders placed as a guest with the same email count too
  const theirOrders = user ? { $or: [{ userId: user._id }, { email: user.email }] } : null;

  if (promo.firstPurchaseOnly && (await Order.exists(theirOrders))) {
    return fail("Promo valid only for first purchase");
  }

  if (promo.oneTimePerUser && (await Order.exists({ ...theirOrders, promoCode: normalized }))) {
    return fail("You have already used this promo code");
  }

  // Same sum the checkout shows (PromoCodeInput)
  const amount = (cartValue * promo.discount) / 100;
  return { valid: true, code: normalized, percent: promo.discount, amount };
}

// Counts one use of a promo code, so maxUses applies. Call once, right after the order is
// created: the unique paymentReference means only one of the webhook / verify-payment gets there.
export async function countPromoUse(code) {
  if (!code) return;
  try {
    await PromoCode.updateOne({ code }, { $inc: { usedCount: 1 } }).collation({ locale: "en", strength: 2 });
  } catch (err) {
    console.error(`countPromoUse(${code}) failed:`, err);
  }
}
