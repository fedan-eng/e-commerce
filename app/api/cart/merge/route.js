// app/api/cart/merge/route.js
// Merges visitor cart (from localStorage) with user's DB cart on login

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userData = verifyToken(token);
    const { visitorCart } = await req.json();

    if (!Array.isArray(visitorCart)) {
      return new Response(JSON.stringify({ error: "Invalid visitor cart" }), { status: 400 });
    }

    // Load existing user from DB
    const user = await User.findById(userData.id);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const dbItems = user.cart?.items || [];

    // Build a map keyed by "_id|color" for O(1) lookup
    const merged = new Map(
      dbItems.map(item => [`${item._id}|${item.color}`, { ...item }])
    );

    // Merge visitor cart items
    for (const visitorItem of visitorCart) {
      const key = `${visitorItem._id}|${visitorItem.color}`;
      if (merged.has(key)) {
        // Same product+color exists — add quantities
        merged.get(key).quantity += visitorItem.quantity;
      } else {
        // New item — add it
        merged.set(key, { ...visitorItem });
      }
    }

    const mergedItems = [...merged.values()];

    // Update user's cart in DB
    await User.findByIdAndUpdate(userData.id, {
      "cart.items": mergedItems,
      "cart.updatedAt": new Date(),
      "cart.abandonedEmailSent": false,
    });

    return new Response(JSON.stringify({ cart: mergedItems }), { status: 200 });
  } catch (err) {
    console.error("Cart merge error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
