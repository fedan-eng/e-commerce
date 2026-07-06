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
    
    console.log("/api/auth/me - Session check:", session ? "Session found" : "No session");
    
    if (session && session.user) {
      console.log("/api/auth/me - Session user:", session.user);
      
      // Try to get user by ID first, fall back to email if ID is missing
      let user;
      if (session.user.id) {
        user = await User.findById(session.user.id).select("-password");
      } else if (session.user.email) {
        user = await User.findOne({ email: session.user.email }).select("-password");
      }
      
      if (!user) {
        console.log("/api/auth/me - User not found in DB for ID:", session.user.id, "or email:", session.user.email);
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

      console.log("/api/auth/me - User found:", user.email);
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
