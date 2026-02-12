// models/PromoCode.js
import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expiresAt: { type: Date },
  minCartValue: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },

  firstPurchaseOnly: { type: Boolean, default: false },
  oneTimePerUser: { type: Boolean, default: false },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.models.PromoCode ||
  mongoose.model("PromoCode", PromoCodeSchema);
