import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export const POST = async (req, context) => {
  await connectDB();

  const { id } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userData;
  try {
    userData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 });
  }

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const comment = {
    user: userData.id,
    text: text.trim(),
    createdAt: new Date(),
    status: "pending", // 👈 requires admin approval before showing publicly
  };

  product.comments.push(comment);
  await product.save();

  return NextResponse.json(comment, { status: 200 });
};

export const GET = async (req, context) => {
  await connectDB();

  const { id } = await context.params;

  try {
    const product = await Product.findById(id).populate("comments.user", "firstName");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Only return approved comments to the public.
    // Comments with no status field are treated as approved (legacy comments
    // posted before the status field was added to the schema).
    const approved = product.comments.filter(
      (c) => !c.status || c.status === "approved"
    );

    return NextResponse.json(approved, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};