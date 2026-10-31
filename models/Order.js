// models/Order.js
import mongoose from "mongoose";
import PromoCode from "./PromoCode";

// Online checkout orders need delivery/contact details; manual (offline) sales don't
function requiredIfOnline() {
  return this.source !== "manual";
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  email: {
    type: String,
    required: requiredIfOnline,
  },

  address: {
    type: String,
    required: requiredIfOnline,
  },

  items: {
    type: Array,
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
  },

  addPhone: {
    type: String,
  },

  region: {
    name: { type: String, required: requiredIfOnline },
    fee: { type: Number, required: requiredIfOnline },
  },

  city: {
    type: String,
    required: requiredIfOnline,
  },

  orderNote: {
    type: String,
    default: "",
  },

  subTotal: { type: Number, required: true },

  deliveryFee: { type: Number, required: true },

  discount: { type: Number, default: 0 },

  total: { type: Number, required: true },

  promoCode: { type: String, default: null },

  // Creator code from the shopper's ?ref= link (lib/referral.js), credited when no creator code was typed
  referralCode: { type: String, default: null },

  // The creator this order is credited to and their commission rate when it was placed, so
  // changing a creator's rate later doesn't rewrite what past orders earned (lib/creatorStats.js)
  creatorCode: { type: String, default: null },
  commissionPercent: { type: Number, default: null },

  deliveryType: {
    type: String,
    enum: ["Free", "Regular", "Express"],
    required: requiredIfOnline,
  },

  phone: {
    type: Number,
    required: requiredIfOnline,
  },
  paymentMethod: {
    type: String,
    enum: ["paystack", "flutterwave", "cash", "transfer", "pos"],
    required: false,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "failed"],
    default: "paid",
  },
  paymentReference: {
    type: String,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: [
      "confirmed",
      "processing",
      "shipped",
      "intransit",
      "delivered",
      "cancelled",
      "returned",
    ],
    default: "confirmed",
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // "online" = storefront checkout, "manual" = entered by staff in the admin console
  source: {
    type: String,
    enum: ["online", "manual"],
    default: "online",
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  followUpSent: {
    type: Boolean,
    default: false,
  },
  gaClientId: {
    type: String,
    default: null,
  },
  gaFired: {
    type: Boolean,
    default: false,
  },
  // true once this order's quantities are included in Product.soldCount (see lib/soldCount.js)
  soldCounted: {
    type: Boolean,
    default: false,
  },
  // Set when the review reminder was sent, or when there was nothing left to review
  // (app/api/cron/review-requests)
  reviewReminderSentAt: {
    type: Date,
    default: null,
  },
});

// "First order only" promo codes look up past orders by phone (lib/promo.js)
orderSchema.index({ phone: 1 });

const upper = (v) => String(v || "").trim().toUpperCase();

// Same credit rule as lib/creatorStats.js: a typed creator code wins, then the ?ref= link
orderSchema.pre("save", async function () {
  if (!this.isNew || this.creatorCode) return;
  const typed = upper(this.promoCode);
  const ref = upper(this.referralCode);
  if (!typed && !ref) return;
  try {
    const docs = await PromoCode.find({ code: { $in: [typed, ref].filter(Boolean) }, type: "creator" })
      .collation({ locale: "en", strength: 2 })
      .select("code commissionPercent")
      .lean();
    const byCode = Object.fromEntries(docs.map((d) => [upper(d.code), d]));
    const credit = byCode[typed] || byCode[ref];
    if (credit) {
      this.creatorCode = upper(credit.code);
      this.commissionPercent = Number(credit.commissionPercent) || 0;
    }
  } catch (err) {
    // Never block an order over this; stats fall back to the code's current rate
    console.error("Creator credit lookup failed:", err.message);
  }
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);