import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";
import { getServerSession } from "next-auth";
import { handler } from "@/lib/nextauth";

export async function GET(req) {
  try {
    await connectDB();

    // First, try to get NextAuth session (for Google login)
    const session = await getServerSession(handler);
    
    if (session && session.user) {
      // User authenticated via NextAuth (Google)
      const user = await User.findById(session.user.id).select("-password");
      
      if (!user) {
        return new Response(JSON.stringify({ message: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (user.isActive === false) {
        return new Response(JSON.stringify({ message: "Account suspended" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          message: "User authenticated",
          user,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fall back to custom JWT token (for regular login)
    const cookies = req.headers.get("cookie");
    if (!cookies) {
      return new Response(JSON.stringify({ message: "No token found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { token } = parse(cookies);
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken.id) {
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = decodedToken.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (user.isActive === false) {
      return new Response(JSON.stringify({ message: "Account suspended" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "User authenticated",
        user,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
