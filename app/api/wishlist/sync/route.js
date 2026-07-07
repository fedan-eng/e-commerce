import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";
import { getServerSession } from "next-auth";
import { handler } from "@/lib/nextauth";

export async function POST(req) {
  try {
    await connectDB();

    // First, try to get NextAuth session (for Google login)
    const session = await getServerSession(handler);
    let userId;

    if (session && session.user) {
      userId = session.user.id;
    } else {
      // Fall back to custom JWT token (for regular login)
      const cookies = req.headers.get("cookie");
      if (!cookies) return new Response(null, { status: 401 });

      const { token } = parse(cookies);
      if (!token) return new Response(null, { status: 401 });

      const decoded = verifyToken(token);
      if (!decoded?.id) return new Response(null, { status: 401 });
      userId = decoded.id;
    }

    const { items } = await req.json();

    await User.findByIdAndUpdate(userId, {
      "wishlist.items":     items || [],
      "wishlist.updatedAt": new Date(),
    });

    return Response.json({ message: "Wishlist synced" });
  } catch (err) {
    console.error("Wishlist sync error:", err);
    return new Response(null, { status: 500 });
  }
}