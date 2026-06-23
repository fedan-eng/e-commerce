import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
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
  paymentMethod: {
    type: String,
    enum: ["paystack", "flutterwave"],
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

const Order = mongoose.model("Order", orderSchema);

async function updateOrdersToDelivered() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("Missing MONGODB_URI environment variable");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Update all orders
    const result = await Order.updateMany(
      { status: { $ne: "Delivered" } }, // Only update orders not already delivered
      {
        $set: { status: "Delivered" },
        $push: {
          statusHistory: {
            status: "Delivered",
            date: new Date(),
          },
        },
      }
    );

    console.log(`\n✨ Update Complete!`);
    console.log(`📦 Modified: ${result.modifiedCount} orders`);
    console.log(`⏭️  Matched: ${result.matchedCount} orders`);

    // Show a sample of updated orders
    const sampleOrders = await Order.find({ status: "Delivered" })
      .limit(3)
      .select("email firstName status createdAt");
    console.log("\n📋 Sample of updated orders:");
    console.table(sampleOrders);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error updating orders:", error.message);
    process.exit(1);
  }
}

updateOrdersToDelivered();
