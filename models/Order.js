// models/Order.js
import mongoose from "mongoose";

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
  // Review emails (app/api/cron/review-requests): the first ask, then one reminder
  reviewRequestSentAt: {
    type: Date,
    default: null,
  },
  reviewReminderSentAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);