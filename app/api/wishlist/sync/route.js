import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

export async function POST(req) {
  try {
    await connectDB();

    const cookies = req.headers.get("cookie");
    if (!cookies) return new Response(null, { status: 401 });

    const { token } = parse(cookies);
    if (!token) return new Response(null, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.id) return new Response(null, { status: 401 });

    const { items } = await req.json();

    await User.findByIdAndUpdate(decoded.id, {
      "wishlist.items":     items || [],
      "wishlist.updatedAt": new Date(),
    });

    return Response.json({ message: "Wishlist synced" });
  } catch (err) {
    console.error("Wishlist sync error:", err);
    return new Response(null, { status: 500 });
  }
}