import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // In case the user checked out as a guest
  },
  email: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  items: {
    type: Array,
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  addPhone: {
    type: String,
  },

  region: {
    name: { type: String, required: true },
    fee: { type: Number, required: true },
  },

  city: {
    type: String,
    required: true,
  },

  subTotal: { type: Number, required: true },

  deliveryFee: { type: Number, required: true },

  discount: { type: Number, default: 0 },

  total: { type: Number, required: true },

  promoCode: { type: String, default: null },

  deliveryType: {
    type: String,
    enum: ["Free", "Regular", "Express"],
    required: true,
  },

  phone: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Confirmed",
      "Processed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
    default: "Confirmed",
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
  followUpSent: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
