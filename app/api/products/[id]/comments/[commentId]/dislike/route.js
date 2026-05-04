import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export const POST = async (req, context) => {
  await connectDB();

  const { id, commentId } = await context.params;

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

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Remove user from likes if they exist
    comment.likes = comment.likes.filter(
      (userId) => userId.toString() !== userData.id
    );

    // Add user to dislikes if not already there
    const isAlreadyDisliked = comment.dislikes.some(
      (userId) => userId.toString() === userData.id
    );

    if (isAlreadyDisliked) {
      // Undislike - remove user from dislikes
      comment.dislikes = comment.dislikes.filter(
        (userId) => userId.toString() !== userData.id
      );
    } else {
      // Dislike - add user to dislikes
      comment.dislikes.push(userData.id);
    }

    await product.save();

    return NextResponse.json({
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isLiked: false,
      isDisliked: !isAlreadyDisliked,
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
