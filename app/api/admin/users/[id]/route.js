// app/api/admin/users/[id]/route.js  ← NEW file

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import PromoCode from "@/models/PromoCode";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// GET single user + their orders
export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const admin = verifyToken(token);
    if (admin.role !== "admin") return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid user ID" }), { status: 400 });
    }

    const user = await User.findById(id)
      .select("-password -resetPasswordCode -resetPasswordExpiry")
      .lean();

    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    // Fetch their orders
    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    // Creator codes to link on the Account card (a code belongs to at most one account)
    const creatorCodes = (await PromoCode.find({ type: "creator" }).select("code creatorName creatorUser").sort({ code: 1 }).lean())
      .map((p) => ({ _id: String(p._id), code: p.code, creatorName: p.creatorName || "", linkedTo: p.creatorUser ? String(p.creatorUser) : null }));

    return new Response(JSON.stringify({ user, orders, creatorCodes }), { status: 200 });
  } catch (err) {
    console.error("Admin user GET error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// PATCH — update role or isActive (ban/unban). With role "creator", creatorCodes = the promo
// code ids whose dashboard they get; codes no longer listed are unlinked from them.
export async function PATCH(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const admin = verifyToken(token);
    if (admin.role !== "admin") return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });

    // Prevent admin from modifying themselves
    if (admin.id === id) {
      return new Response(JSON.stringify({ message: "Cannot modify your own account" }), { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid user ID" }), { status: 400 });
    }

    const body = await req.json();
    const updates = {};

    // Only allow role and isActive to be changed from admin panel
    if (body.role !== undefined) {
      if (!["user", "creator", "admin"].includes(body.role)) {
        return new Response(JSON.stringify({ message: "Invalid role" }), { status: 400 });
      }
      updates.role = body.role;
    }

    let codeIds = null;
    if (body.role === "creator") {
      codeIds = Array.isArray(body.creatorCodes) ? body.creatorCodes.filter((c) => mongoose.Types.ObjectId.isValid(c)) : [];
      if (!codeIds.length) {
        return new Response(JSON.stringify({ message: "Pick at least one creator code for their dashboard" }), { status: 400 });
      }
    }

    if (body.isActive !== undefined) {
      updates.isActive = body.isActive;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select("-password -resetPasswordCode -resetPasswordExpiry");

    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    // Switching the role off keeps the links, so turning it back on restores the same dashboard
    if (codeIds) {
      await PromoCode.updateMany({ creatorUser: id, _id: { $nin: codeIds } }, { $set: { creatorUser: null } });
      await PromoCode.updateMany({ _id: { $in: codeIds }, type: "creator" }, { $set: { creatorUser: id } });
    }

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    console.error("Admin user PATCH error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}