import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

export async function GET(req) {
  try {
    await connectDB(); // Connect to the database

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

    // Fetch the user from the database using the ID
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
        user, // Return the user data from the database
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching user:", error); // Log the error for debugging
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
