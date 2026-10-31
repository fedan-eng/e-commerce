//api/products/[id]/comments/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { findVerifiedPurchase } from "@/lib/reviews";

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

  const { text, rating } = await req.json();
  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 });
  }

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // One review per user per product: approved (ratings) or still pending (comments)
  const alreadyReviewed =
    product.ratings.some((r) => r.user?.toString() === userData.id) ||
    product.comments.some((c) => c.user?.toString() === userData.id);
  if (alreadyReviewed) {
    return NextResponse.json({ error: "You've already reviewed this product" }, { status: 400 });
  }

  // Bought and received it? Then it's a verified-purchase review
  const purchase = await findVerifiedPurchase(userData.id, id);

  const comment = {
    user: userData.id,
    text: text.trim(),
    rating: rating || 5, // Store rating with default of 5
    createdAt: new Date(),
    status: "pending",
    verified: Boolean(purchase),
    orderId: purchase?.orderId || null,
    color: purchase?.color || "",
  };

  product.comments.push(comment);

  await product.save();

  return NextResponse.json(comment, { status: 200 });
};

export const GET = async (req, context) => {
  await connectDB();

  const { id } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let currentUserId = null;
  if (token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_SECRET);
      currentUserId = userData.id;
    } catch (error) {
      // Token is invalid, but we'll continue without user context
      console.log("Invalid token provided for comments fetch");
    }
  }

  try {
    const product = await Product.findById(id).populate({
      path: "comments.user",
      model: "User",
      select: "firstName",
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Only return approved comments to the public.
    // Comments with no status field are treated as approved (legacy comments
    // posted before the status field was added to the schema).
    const approved = product.comments.filter(
      (c) => !c.status || c.status === "approved"
    );

    // Add like/dislike status for the current user
    const commentsWithStatus = approved.map((comment) => {
      const commentObj = comment.toObject();

      // Handle legacy comments that may not have likes/dislikes arrays
      const likes = commentObj.likes || [];
      const dislikes = commentObj.dislikes || [];

      if (currentUserId) {
        commentObj.isLiked = likes.some(
          (userId) => userId.toString() === currentUserId
        );
        commentObj.isDisliked = dislikes.some(
          (userId) => userId.toString() === currentUserId
        );
      } else {
        commentObj.isLiked = false;
        commentObj.isDisliked = false;
      }

      // Public payload: counts only (not who voted), and never the order behind a review
      const { orderId, ...publicComment } = commentObj;
      return { ...publicComment, likes: likes.length, dislikes: dislikes.length };
    });

    return NextResponse.json(commentsWithStatus, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};