// models/WhatsAppReview.js
// A WhatsApp chat screenshot shown in the storefront review carousels.
// `placements` says where it appears: "home" and/or category slugs (see lib/whatsappReviews.js).
import mongoose from "mongoose";

const WhatsAppReviewSchema = new mongoose.Schema(
  {
    imageUrl:   { type: String, required: true, trim: true },
    placements: { type: [String], default: [] },
    note:       { type: String, trim: true, default: "" }, // admin-only label, e.g. "MagFlex — Tolu"
    published:  { type: Boolean, default: true },
    sortOrder:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

WhatsAppReviewSchema.index({ placements: 1, published: 1, sortOrder: 1 });

export default mongoose.models.WhatsAppReview ||
  mongoose.model("WhatsAppReview", WhatsAppReviewSchema);
