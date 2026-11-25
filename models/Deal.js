// models/Deal.js — a Black Friday flash deal (lib/deals.js): "first 30 MagSnap at 35% off" or
// "first 20 MagFlex get a free cord". Counted in units sold; `claimed` only goes up when an
// order is paid, so a deal can run a few over its quota when several people pay at once.
import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },   // "35% off MagSnap"
    type:     { type: String, enum: ["discount", "gift"], required: true },
    percent:  { type: Number, min: 1, max: 90 },                // discount deals
    gift:     { type: String, trim: true, default: "" },        // gift deals: "Free cord"
    // gift deals: the product given away, so the cart, popup and order show its real photo
    giftProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // share one quota
    quota:    { type: Number, required: true, min: 1 },
    claimed:  { type: Number, default: 0, min: 0 },
    active:   { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Deal || mongoose.model("Deal", dealSchema);
