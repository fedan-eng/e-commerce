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

  const { text, rating } = await req.json();
  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 });
  }

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check if user has already rated this product (via comment or rating)
  const existingRating = product.ratings.find(
    (r) => r.user.toString() === userData.id
  );
  if (existingRating) {
    return NextResponse.json({ error: "Already rated" }, { status: 400 });
  }

  const comment = {
    user: userData.id,
    text: text.trim(),
    rating: rating || 5, // Store rating with default of 5
    createdAt: new Date(),
    status: "pending", // 👈 requires admin approval before showing publicly
  };

  product.comments.push(comment);

  // Also add to ratings array for average calculation
  product.ratings.push({ user: userData.id, value: comment.rating });

  // Recalculate averages
  const sum = product.ratings.reduce((acc, r) => acc + r.value, 0);
  product.ratingsCount = product.ratings.length;
  product.averageRating = parseFloat((sum / product.ratingsCount).toFixed(1));

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

    // Add like/dislike status for the current user
    const commentsWithStatus = approved.map(comment => {
      const commentObj = comment.toObject();
      
      if (currentUserId) {
        commentObj.isLiked = comment.likes.some(
          userId => userId.toString() === currentUserId
        );
        commentObj.isDisliked = comment.dislikes.some(
          userId => userId.toString() === currentUserId
        );
      } else {
        commentObj.isLiked = false;
        commentObj.isDisliked = false;
      }

      return commentObj;
    });

    return NextResponse.json(commentsWithStatus, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};