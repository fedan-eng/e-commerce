// app/api/admin/users/route.js  ← NEW file

import { connectDB } from "@/lib/db";
import User from "@/models/User";
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

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -resetPasswordCode -resetPasswordExpiry")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return new Response(
      JSON.stringify({ users, total, page, totalPages: Math.ceil(total / limit) }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin users GET error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}