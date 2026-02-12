import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export const POST = async (req, context) => {
  await connectDB(); // Connect to DB

  const { id } = await context.params;

  // Get JWT token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify token
  let userData;
  try {
    userData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Parse comment text from request body
  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json(
      { error: "Comment text required" },
      { status: 400 }
    );
  }

  // Find product by ID
  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Create comment object
  const comment = {
    user: userData.id,
    text: text.trim(),
    createdAt: new Date(),
  };

  // Save comment to product
  product.comments.push(comment);
  await product.save();

  return NextResponse.json(comment, { status: 200 });
};

export const GET = async (req, context) => {
  await connectDB();

  const { params } = await context;
  const { id } = await params;

  try {
    const product = await Product.findById(id).populate(
      "comments.user",
      "firstName"
    );
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(product.comments, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
