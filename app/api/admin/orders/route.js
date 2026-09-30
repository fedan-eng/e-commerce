// app/api/admin/orders/route.js

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";
import { normalizeStatusKey } from "@/lib/orderStatus";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const user = verifyToken(token);
    if (user.role !== "admin") {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const { searchParams } = new URL(req.url);
    const page   = parseInt(searchParams.get("page"))  || 1;
    const limit  = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || "";
    const search = (searchParams.get("search") || "").trim();
    const days   = parseInt(searchParams.get("days"))  || 0;

    const query = {};

    // Status filter - normalize to match stored format
    if (status && status !== "all") {
      const normalizedStatus = normalizeStatusKey(status);
      query.status = { $regex: new RegExp(`^${normalizedStatus}$`, "i") };
    }

    // Days filter
    if (days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      query.createdAt = { $gte: since };
    }

    // Search filter - escape regex and support short IDs
    if (search) {
      const conditions = [];

      // Escape special regex characters
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      if (mongoose.isValidObjectId(search)) {
        const oid = new mongoose.Types.ObjectId(search);
        conditions.push({ _id: oid });
        conditions.push({ userId: oid });
      } else if (search.length >= 8) {
        // Try to match by short ID (last 8 characters)
        conditions.push({ _id: { $regex: escapedSearch + "$", $options: "i" } });
      }

      // Partial text fallback for email / name
      conditions.push({ email:      { $regex: escapedSearch, $options: "i" } });
      conditions.push({ firstName:  { $regex: escapedSearch, $options: "i" } });

      query.$or = conditions;
    }

    const total  = await Order.countDocuments(query);

    // Stats should ignore status filter but respect days and search filters
    const statsQuery = { ...query };
    delete statsQuery.status;

    const [statsResults] = await Order.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: null,
          total:      { $sum: 1 },
          confirmed:  { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "confirmed"] }, 1, 0] } },
          processing: { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "processing"] }, 1, 0] } },
          shipped:    { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "shipped"]   }, 1, 0] } },
          intransit:  { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "intransit"] }, 1, 0] } },
          delivered:  { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "delivered"] }, 1, 0] } },
          cancelled:  { $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "cancelled"] }, 1, 0] } },
        },
      },
    ]);

    const stats = statsResults ?? { total: 0, confirmed: 0, processing: 0, shipped: 0, intransit: 0, delivered: 0, cancelled: 0 };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return new Response(
      JSON.stringify({ orders, total, page, totalPages: Math.ceil(total / limit), stats }),
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (err) {
    console.error("[admin/orders GET]", err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}