// lib/paystackOrder.js — turns a successful Paystack payment into Order fields.
// Shared by app/api/verify-payment and app/api/webhooks/paystack so both build the same order.
import PendingCheckout from "@/models/PendingCheckout";
import { sendEmail } from "@/lib/mailer";

// Paystack normally returns metadata as an object, but can return it as a (possibly truncated) string
export function parseMetadata(meta) {
  if (meta && typeof meta === "object") return meta;
  if (typeof meta !== "string") return null;
  try {
    const parsed = JSON.parse(meta);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

// The checkout as saved by /api/paystack, falling back to Paystack's metadata for payments
// started before PendingCheckout existed
export async function loadCheckout(reference, rawMetadata) {
  const pending = await PendingCheckout.findOne({ reference })
    .lean()
    .catch((err) => {
      console.error("[Paystack order] PendingCheckout lookup failed:", err);
      return null;
    });
  if (pending?.data) return { source: "pending", data: pending.data };

  const meta = parseMetadata(rawMetadata);
  return meta ? { source: "metadata", data: meta } : { source: "none", data: {} };
}

// Fields for Order.create. `amount` (naira) is the fallback total; `fallbackUserId` is the
// signed-in user when the checkout didn't record one.
export function orderFieldsFrom(checkout, { reference, amount, fallbackUserId = null }) {
  const meta = checkout || {};
  const info = meta.deliveryInfo || meta; // older payments used a flat structure
  const simple = Boolean(meta.simpleCheckout);
  const text = (key) => (simple ? "" : String(info[key] ?? meta[key] ?? "").trim());

  const deliveryFee = Number(meta.deliveryFee) || 0;
  const region = simple ? null : info.region || meta.region;

  return {
    userId: meta.userId || fallbackUserId || null,
    email: String(info.email || meta.email || "").trim(),
    firstName: text("firstName"),
    lastName: text("lastName"),
    phone: text("phone"),
    addPhone: text("addPhone"),
    address: text("address"),
    city: text("city"),
    region: {
      name: typeof region === "string" ? region : region?.name || "",
      fee: Number(region?.fee ?? deliveryFee) || 0,
    },
    deliveryType: (!simple && (info.deliveryType || meta.deliveryType)) || "Regular",
    orderNote: text("orderNote"),
    items: (meta.cartItems || []).map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    })),
    subTotal: Number(meta.subTotal) || 0,
    discount: Number(meta.discount) || 0,
    deliveryFee,
    total: Number(meta.total) || Number(amount) || 0,
    promoCode: meta.promoCode || null,
    referralCode: meta.referralCode || null,
    paymentMethod: "paystack",
    paymentReference: reference,
    paymentStatus: "paid",
    status: "confirmed",
    statusHistory: [{ status: "confirmed", date: new Date() }],
    gaClientId: meta.gaClientId || null,
  };
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// A customer paid but no order could be saved: tell the admin so it can be created by hand
export async function alertUnsavedOrder({ reference, paystackData, error, source }) {
  const metaText =
    typeof paystackData?.metadata === "string"
      ? paystackData.metadata
      : JSON.stringify(paystackData?.metadata ?? null, null, 2);

  const lines = [
    "A customer paid on Paystack but the order could not be saved. Please create it manually and contact the customer.",
    "",
    `Reference: ${reference}`,
    `Amount: NGN ${(Number(paystackData?.amount) || 0) / 100}`,
    `Paid at: ${paystackData?.paid_at || "unknown"}`,
    `Paystack customer email: ${paystackData?.customer?.email || "unknown"}`,
    `Order details came from: ${source}`,
    `Error: ${error?.message || error}`,
    "",
    "Metadata from Paystack:",
    String(metaText).slice(0, 5000),
  ];
  const text = lines.join("\n");

  try {
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `ACTION NEEDED: paid order not saved (${reference})`,
      text,
      `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`
    );
  } catch (mailErr) {
    console.error("[Paystack order] Could not send unsaved-order alert:", mailErr);
  }
}
