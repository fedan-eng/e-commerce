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

    // Remove user from dislikes if they exist
    comment.dislikes = comment.dislikes.filter(
      (userId) => userId.toString() !== userData.id
    );

    // Add user to likes if not already there
    const isAlreadyLiked = comment.likes.some(
      (userId) => userId.toString() === userData.id
    );

    if (isAlreadyLiked) {
      // Unlike - remove user from likes
      comment.likes = comment.likes.filter(
        (userId) => userId.toString() !== userData.id
      );
    } else {
      // Like - add user to likes
      comment.likes.push(userData.id);
    }

    await product.save();

    return NextResponse.json({
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isLiked: !isAlreadyLiked,
      isDisliked: false,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
