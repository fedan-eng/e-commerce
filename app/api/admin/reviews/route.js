// app/api/admin/reviews/route.js  ← NEW file

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";

// GET all comments across all products, flattened + filterable
export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    const admin = verifyToken(token);
    if (admin.role !== "admin") return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page   = parseInt(searchParams.get("page")) || 1;
    const limit  = parseInt(searchParams.get("limit")) || 20;

    // Pull all products that have comments, populate user info
    const products = await Product.find({ "comments.0": { $exists: true } })
      .select("name image comments averageRating ratingsCount")
      .populate("comments.user", "firstName lastName email")
      .lean();

    // Flatten all comments into one array with product context
    let reviews = [];
    for (const product of products) {
      for (const comment of product.comments) {
        reviews.push({
          _id: comment._id,
          text: comment.text,
          status: comment.status || "pending",
          createdAt: comment.createdAt,
          user: comment.user,
          product: {
            _id: product._id,
            name: product.name,
            image: product.image,
          },
        });
      }
    }

    // Filter by status
    if (status !== "all") {
      reviews = reviews.filter(r => (r.status || "pending") === status);
    }

    // Filter by search (product name or comment text)
    if (search) {
      const q = search.toLowerCase();
      reviews = reviews.filter(r =>
        r.text?.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.user?.firstName?.toLowerCase().includes(q) ||
        r.user?.lastName?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = reviews.length;
    const paginated = reviews.slice((page - 1) * limit, page * limit);

    return new Response(
      JSON.stringify({ reviews: paginated, total, page, totalPages: Math.ceil(total / limit) }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin reviews GET error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}