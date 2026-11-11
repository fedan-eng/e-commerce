// models/PendingCheckout.js
// Everything needed to create an order, saved when the shopper is sent to Paystack and looked up
// by payment reference when the payment is verified (verify-payment + webhook). Paystack's
// metadata can come back cut short (it once ended mid order note and a paid order was lost), so
// the order is built from this record rather than from what Paystack echoes back.
import mongoose from "mongoose";

const PendingCheckoutSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    // Removed automatically once it can no longer matter
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  },
  { minimize: false }
);

export default mongoose.models.PendingCheckout ||
  mongoose.model("PendingCheckout", PendingCheckoutSchema);
