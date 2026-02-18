// app/api/admin/orders/route.js  ← NEW file

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";

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
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query = {};
  if (status && status !== "all") {
  query.status = { $regex: new RegExp(`^${status}$`, "i") };
}
    if (search) query._id = { $regex: search, $options: "i" };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return new Response(
      JSON.stringify({ orders, total, page, totalPages: Math.ceil(total / limit) }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}