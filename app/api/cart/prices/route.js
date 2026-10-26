// app/api/cart/prices/route.js — today's price for each product in a cart, so checkout shows
// what /api/paystack will actually charge (see lib/pricing.js).
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { ids } = await req.json();
    const valid = Array.isArray(ids) ? [...new Set(ids)].filter((id) => mongoose.isValidObjectId(id)).slice(0, 100) : [];

    await connectDB();
    const products = await Product.find({ _id: { $in: valid } }).select("name price availability").lean();

    // { [productId]: { price, available } }; ids missing from the reply are no longer sold
    const prices = Object.fromEntries(
      products.map((p) => [String(p._id), { price: p.price, available: p.availability !== false }])
    );
    return Response.json({ prices }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Cart prices error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
