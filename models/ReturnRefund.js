// models/ReturnRefund.js
// A customer's refund (RF-…) or return (RT-…) request for one order item. Kept apart from the
// Order so each has its own status and history; the flows live in lib/returnRefund.js.
import mongoose from "mongoose";
import { REQUEST_TYPES, statusesOf } from "@/lib/returnRefund";

const allStatuses = [...new Set(Object.keys(REQUEST_TYPES).flatMap(statusesOf))];

const ReturnRefundSchema = new mongoose.Schema(
  {
    code:   { type: String, required: true, unique: true }, // RF-7K3F9Q / RT-7K3F9Q
    type:   { type: String, enum: Object.keys(REQUEST_TYPES), required: true },
    status: { type: String, enum: allStatuses, default: "requested" },
    history: [
      {
        status: { type: String, required: true },
        date:   { type: Date, default: Date.now },
        note:   { type: String, default: "" }, // the message to the customer at that step
      },
    ],

    orderId:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Copied from the order, so the request still reads right if the product changes
    itemIndex: { type: Number, required: true },
    item: {
      productId: { type: String, default: "" },
      name:      { type: String, required: true },
      image:     { type: String, default: "" },
      color:     { type: String, default: "" },
      price:     { type: Number, default: 0 },
    },
    quantity:  { type: Number, required: true, min: 1 },
    reason:    { type: String, required: true },
    condition: { type: String, default: "" }, // returns only

    // Contact details from the order; the /track page checks the email or phone against these
    firstName: { type: String, default: "" },
    lastName:  { type: String, default: "" },
    email:     { type: String, default: "" },
    phone:     { type: String, default: "" },
    // Returns: where the item goes back to
    address:   { type: String, default: "" },
    city:      { type: String, default: "" },
    region:    { type: String, default: "" },

    // Refunds only
    bank: {
      bankName:      { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      accountName:   { type: String, default: "" },
    },
    amount:          { type: Number, default: 0 },    // price × quantity when requested
    refundedAmount:  { type: Number, default: null }, // what was actually sent
    refundReference: { type: String, default: "" },   // bank transfer reference

    customerNote: { type: String, default: "" }, // latest message, shown on /track and in emails
    adminNote:    { type: String, default: "" }, // admins only
  },
  { timestamps: true }
);

ReturnRefundSchema.index({ type: 1, status: 1, createdAt: -1 });
ReturnRefundSchema.index({ orderId: 1 });

export default mongoose.models.ReturnRefund || mongoose.model("ReturnRefund", ReturnRefundSchema);
