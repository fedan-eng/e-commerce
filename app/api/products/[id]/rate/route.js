import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

// ================== POST ==================
export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { value } = await req.json();
  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Prevent double rating
  const existingRating = product.ratings.find(
    (r) => r.user.toString() === decoded.id
  );
  if (existingRating) {
    return NextResponse.json({ error: "Already rated" }, { status: 400 });
  }

  // Add new rating
  product.ratings.push({ user: decoded.id, value });

  // 🔄 Recalculate averages
  const sum = product.ratings.reduce((acc, r) => acc + r.value, 0);
  product.ratingsCount = product.ratings.length;
  product.averageRating = parseFloat((sum / product.ratingsCount).toFixed(1));

  await product.save();

  return NextResponse.json({
    message: "Rating submitted successfully",
    averageRating: product.averageRating,
    ratingsCount: product.ratingsCount,
    userRating: value, // 👈 return what the user just rated
  });
}

// ================== GET ==================
export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  const token = req.cookies.get("token")?.value;
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      console.error(error);
    }
  }

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let userHasRated = false;
  let userRating = null;

  if (userId) {
    const ratingDoc = product.ratings.find((r) => r.user.toString() === userId);
    if (ratingDoc) {
      userHasRated = true;
      userRating = ratingDoc.value;
    }
  }

  return NextResponse.json({
    averageRating: product.averageRating,
    ratingsCount: product.ratingsCount,
    userHasRated,
    userRating,
  });
}
