// models/CreatorPayout.js
// Money sent to a creator. What they're owed = earned commission (lib/creatorStats.js) minus these.
import mongoose from "mongoose";

const CreatorPayoutSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // creator promo code, in capitals
    amount: { type: Number, required: true, min: 0.01 },
    paidAt: { type: Date, required: true },
    note: { type: String, default: "" }, // e.g. bank transfer reference; the creator sees it
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

CreatorPayoutSchema.index({ code: 1, paidAt: -1 });

export default mongoose.models.CreatorPayout || mongoose.model("CreatorPayout", CreatorPayoutSchema);
