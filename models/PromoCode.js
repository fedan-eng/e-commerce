// models/PromoCode.js
// Codes are stored in capitals; orders keep the code they used (Order.promoCode),
// which is where the admin's per-code stats come from.
import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    expiresAt: { type: Date },
    minCartValue: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 }, // 0 = no limit
    usedCount: { type: Number, default: 0 },

    firstPurchaseOnly: { type: Boolean, default: false },
    oneTimePerUser: { type: Boolean, default: false },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Off = checkout rejects it, but its orders and stats stay
    active: { type: Boolean, default: true },
    // "creator" codes belong to an influencer; their orders are tracked for payouts
    type: { type: String, enum: ["general", "creator"], default: "general" },
    creatorName: { type: String, default: "" },
    creatorHandle: { type: String, default: "" },
    commissionPercent: { type: Number, default: 0 }, // of product sales after discount
    note: { type: String, default: "" }, // admins only
  },
  { timestamps: true }
);

export default mongoose.models.PromoCode ||
  mongoose.model("PromoCode", PromoCodeSchema);
