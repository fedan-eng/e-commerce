// lib/promo.js — promo code rules, shared by /api/promocode (applying a code) and /api/paystack
// (where the discount is worked out again, so the browser can't choose its own).
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import Order from "@/models/Order";
import User from "@/models/User";
import { isDisposableEmail } from "@/lib/disposableEmail";

// The signed-in user's id from the session cookie, never from the request body
export async function sessionUserId() {
  const token = (await cookies()).get("token")?.value;
  return token ? verifyToken(token)?.id || null : null;
}

// Order.phone is saved as a number, so 08137678990 and +2348137678990 end up as 8137678990 or
// 2348137678990. Returns every stored form of the number, or [] if it isn't one.
export function phoneVariants(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("234")) digits = digits.slice(3);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length < 7) return [];
  return digits.length === 10 ? [Number(digits), Number(`234${digits}`)] : [Number(digits)];
}

/**
 * Checks a promo code for this shopper and cart. Returns
 * { valid: true, code, percent, amount } or { valid: false, status, message, requiresLogin? }.
 * phone / email: the checkout's delivery details, when known. First-order and once-per-person
 * codes also look at orders to that phone, so a fresh email address doesn't make a new customer.
 * Needs an open DB connection.
 */
export async function validatePromo({ code, userId, cartValue, phone, email }) {
  const normalized = String(code || "").trim().toUpperCase();
  const fail = (message, status = 400, extra = {}) => ({ valid: false, status, message, ...extra });

  const promo = normalized
    ? await PromoCode.findOne({ code: normalized }).collation({ locale: "en", strength: 2 })
    : null;
  if (!promo) return fail("Invalid promo code");
  if (promo.active === false) return fail("This promo code is no longer active");

  // First-order and once-per-person codes need to know who's buying
  if ((promo.firstPurchaseOnly || promo.oneTimePerUser) && !userId) {
    return fail("Please log in to use this promo code", 401, { requiresLogin: true });
  }

  const user = userId ? await User.findById(userId).select("email phone") : null;
  if (userId && !user) return fail("Please log in again to use this promo code", 401, { requiresLogin: true });

  const welcomeOnly = promo.firstPurchaseOnly || promo.oneTimePerUser;
  if (welcomeOnly && [user?.email, email].some(isDisposableEmail)) {
    return fail("This code can't be used with a temporary email address. Sign in with your real email to use it.");
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) return fail("Promo code has expired");

  if (cartValue < promo.minCartValue) {
    return fail(`Minimum cart value of ₦${promo.minCartValue.toLocaleString()} required`);
  }

  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return fail("Promo usage limit reached");

  // Orders placed as a guest with the same email count too, and so do orders to the same
  // phone (the delivery number at checkout, or the one on their account) under any email
  const emails = [...new Set([user?.email, email].filter(Boolean).map((e) => String(e).trim().toLowerCase()))];
  const phones = [...new Set([...phoneVariants(phone), ...phoneVariants(user?.phone)])];
  const theirOrders = user
    ? { $or: [{ userId: user._id }, { email: { $in: emails } }, ...(phones.length ? [{ phone: { $in: phones } }] : [])] }
    : null;
  const byPhone = async (extra) => phones.length > 0 && Boolean(await Order.exists({ phone: { $in: phones }, ...extra }));

  if (promo.firstPurchaseOnly && (await Order.exists(theirOrders))) {
    return fail(
      (await byPhone({}))
        ? "This code is for a first order, and this phone number has already ordered with us"
        : "Promo valid only for first purchase"
    );
  }

  if (promo.oneTimePerUser && (await Order.exists({ ...theirOrders, promoCode: normalized }))) {
    return fail(
      (await byPhone({ promoCode: normalized }))
        ? "This phone number has already used this promo code"
        : "You have already used this promo code"
    );
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
