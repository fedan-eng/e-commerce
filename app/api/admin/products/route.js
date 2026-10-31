// app/api/admin/products/route.js  ← NEW file (for creating products)

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const product = await Product.create({
      ...body,
      ratingsCount: 0,
      averageRating: 0,
      ratings: [],
      comments: [],
    });
    revalidateStorefront();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}