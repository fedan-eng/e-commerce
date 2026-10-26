// models/ReferralEvent.js
// One row per visitor, per creator code, per day, per kind of event:
// "click" = arrived through the creator's link, "cart" = then added something to their cart.
// The unique index makes repeat visits and refreshes on the same day count once.
import mongoose from "mongoose";

const ReferralEventSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // creator promo code, in capitals
    type: { type: String, enum: ["click", "cart"], required: true },
    visitorId: { type: String, required: true }, // random id kept in the shopper's browser
    day: { type: String, required: true }, // YYYY-MM-DD, Lagos time
    device: { type: String, enum: ["mobile", "tablet", "desktop"], default: "desktop" },
    path: { type: String, default: "" }, // page the link pointed at (clicks only)
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReferralEventSchema.index({ code: 1, type: 1, visitorId: 1, day: 1 }, { unique: true });
ReferralEventSchema.index({ createdAt: -1, code: 1 });

export default mongoose.models.ReferralEvent || mongoose.model("ReferralEvent", ReferralEventSchema);
