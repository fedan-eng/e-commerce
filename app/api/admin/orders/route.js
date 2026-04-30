// app/api/admin/orders/route.js

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const user = verifyToken(token);
    if (user.role !== "admin") {
      return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page   = parseInt(searchParams.get("page"))  || 1;
    const limit  = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || "";
    const search = (searchParams.get("search") || "").trim();
    const days   = parseInt(searchParams.get("days"))  || 0;

    const query = {};

    // Status filter
    if (status && status !== "all") {
      query.status = { $regex: new RegExp(`^${status}$`, "i") };
    }

    // Days filter
    if (days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      query.createdAt = { $gte: since };
    }

    // Search filter
    if (search) {
      const conditions = [];

      if (mongoose.isValidObjectId(search)) {
        const oid = new mongoose.Types.ObjectId(search);
        conditions.push({ _id: oid });      // exact order ID
        conditions.push({ userId: oid });   // all orders for a customer ID
      }

      // Partial text fallback for email / name
      conditions.push({ email:      { $regex: search, $options: "i" } });
      conditions.push({ firstName:  { $regex: search, $options: "i" } });

      query.$or = conditions;
    }

    const total  = await Order.countDocuments(query);
const [statsResults] = await Order.aggregate([
  {
    $group: {
      _id: null,
      total:     { $sum: 1 },
      confirmed: { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "confirmed"] }, 1, 0] } },
      shipped:   { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "shipped"]   }, 1, 0] } },
      delivered: { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "delivered"] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "cancelled"] }, 1, 0] } },
    },
  },
]);

const stats = statsResults ?? { total: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

   return new Response(
  JSON.stringify({ orders, total, page, totalPages: Math.ceil(total / limit), stats }),
  { status: 200 }
);
  } catch (err) {
    console.error("[admin/orders GET]", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}