// app/api/admin/users/route.js  ← NEW file

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "admin") return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const cartStatus = searchParams.get("cartStatus") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role !== "all") query.role = role;

    // Cart status filtering
    if (cartStatus === "has_cart") {
      query["cart.items.0"] = { $exists: true };
    } else if (cartStatus === "abandoned") {
      // Cart with items that hasn't been updated in 48 hours
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      query["cart.items.0"] = { $exists: true };
      query["cart.updatedAt"] = { $lt: fortyEightHoursAgo };
    }

    // Build sort object
    const sortObj = {};
    if (sortBy === "totalSpent") {
      // For totalSpent, we need to aggregate first, then sort
      // We'll handle this differently below
    } else {
      sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    let users;
    let total;

    if (sortBy === "totalSpent") {
      // Aggregate to get total spent per user
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "userId",
            as: "orders",
          },
        },
        {
          $addFields: {
            totalSpent: {
              $sum: "$orders.total",
            },
          },
        },
        {
          $project: {
            password: 0,
            resetPasswordCode: 0,
            resetPasswordExpiry: 0,
            orders: 0,
          },
        },
        {
          $sort: {
            totalSpent: sortOrder === "asc" ? 1 : -1,
          },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ];

      users = await User.aggregate(pipeline);
      
      // Get total count for pagination
      total = await User.countDocuments(query);
    } else {
      total = await User.countDocuments(query);
      users = await User.find(query)
        .select("-password -resetPasswordCode -resetPasswordExpiry")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    // If not using aggregation, still calculate totalSpent for each user
    if (sortBy !== "totalSpent") {
      const userIds = users.map(u => u._id);
      const orders = await Order.find({ userId: { $in: userIds } }).lean();
      
      const orderTotals = {};
      orders.forEach(order => {
        const userId = order.userId.toString();
        orderTotals[userId] = (orderTotals[userId] || 0) + (order.total || 0);
      });

      users = users.map(user => ({
        ...user,
        totalSpent: orderTotals[user._id.toString()] || 0,
      }));
    }

    return new Response(
      JSON.stringify({ users, total, page, totalPages: Math.ceil(total / limit) }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin users GET error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}