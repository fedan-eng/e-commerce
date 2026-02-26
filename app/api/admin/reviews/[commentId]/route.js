// app/api/admin/reviews/[commentId]/route.js  ← NEW file

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// PATCH — update comment status (approve / archive / pending)
export async function PATCH(req, context) {
  await connectDB();
  const { commentId } = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    const admin = verifyToken(token);
    if (admin.role !== "admin") return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return new Response(JSON.stringify({ message: "Invalid comment ID" }), { status: 400 });
    }

    const body = await req.json();

    // Handle text edit
    if (body.text !== undefined) {
      if (!body.text.trim()) {
        return new Response(JSON.stringify({ message: "Text cannot be empty" }), { status: 400 });
      }
      const product = await Product.findOne({ "comments._id": commentId });
      if (!product) return new Response(JSON.stringify({ message: "Comment not found" }), { status: 404 });
      const comment = product.comments.id(commentId);
      comment.text = body.text.trim();
      await product.save();
      return new Response(JSON.stringify({ message: "Text updated" }), { status: 200 });
    }

    // Handle status change
    const { status } = body;
    if (!["pending", "approved", "archived"].includes(status)) {
      return new Response(JSON.stringify({ message: "Invalid status" }), { status: 400 });
    }

    const product = await Product.findOne({ "comments._id": commentId });
    if (!product) return new Response(JSON.stringify({ message: "Comment not found" }), { status: 404 });

    const comment = product.comments.id(commentId);
    comment.status = status;
    await product.save();

    return new Response(JSON.stringify({ message: "Status updated", status }), { status: 200 });
  } catch (err) {
    console.error("Admin review PATCH error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// DELETE — remove comment entirely from product
export async function DELETE(req, context) {
  await connectDB();
  const { commentId } = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    const admin = verifyToken(token);
    if (admin.role !== "admin") return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return new Response(JSON.stringify({ message: "Invalid comment ID" }), { status: 400 });
    }

    const product = await Product.findOne({ "comments._id": commentId });
    if (!product) return new Response(JSON.stringify({ message: "Comment not found" }), { status: 404 });

    product.comments.pull({ _id: commentId });
    await product.save();

    return new Response(JSON.stringify({ message: "Comment deleted" }), { status: 200 });
  } catch (err) {
    console.error("Admin review DELETE error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}