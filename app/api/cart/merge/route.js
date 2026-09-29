// app/api/cart/merge/route.js
// Merges visitor cart (from localStorage) with user's DB cart on login

import { verifyToken } from "@/lib/auth";
import { mergeVisitorCart } from "@/lib/mergeCart";

export async function POST(req) {
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

    // Use shared merge util
    const mergedItems = await mergeVisitorCart(userData.id, visitorCart);

    return new Response(JSON.stringify({ cart: mergedItems }), { status: 200 });
  } catch (err) {
    console.error("Cart merge error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
