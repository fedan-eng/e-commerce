import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

// GET SINGLE PRODUCT
export async function GET(req, context) {
  const { id } = await context.params;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


export async function PUT(req, context) {
  const { id } = await context.params;
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    const updates = await req.json();
    // Prevent overwriting ratings/comments via this route
    delete updates.ratings;
    delete updates.comments;
    delete updates.ratingsCount;
    delete updates.averageRating;

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// --- NEW: Delete product (admin only) ---
export async function DELETE(req, context) {
  const { id } = await context.params;
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}