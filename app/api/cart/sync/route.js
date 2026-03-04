// app/api/cart/sync/route.js
// Called every time the logged-in user's cart changes.
// Saves items + timestamp to MongoDB.

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      // Not logged in — silently ignore, cart stays in localStorage only
      return new Response(JSON.stringify({ ok: false, message: "Not logged in" }), { status: 200 });
    }

    const userData = verifyToken(token);
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return new Response(JSON.stringify({ message: "Invalid items" }), { status: 400 });
    }

    // If cart is being cleared (checkout or manual clear), wipe the DB cart too
    if (items.length === 0) {
      await User.findByIdAndUpdate(userData.id, {
        "cart.items":             [],
        "cart.updatedAt":         null,
        "cart.abandonedEmailSent": false,
      });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Save cart + refresh timestamp + reset abandoned flag
    // (reset flag so if they add new items after email, they can get another email)
    await User.findByIdAndUpdate(userData.id, {
      "cart.items":             items,
      "cart.updatedAt":         new Date(),
      "cart.abandonedEmailSent": false,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Cart sync error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}