import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { serialize } from "cookie";
import { getServerSession } from "next-auth";
import { handler } from "@/lib/nextauth";

export async function POST(req) {
  await connectDB();
  
  try {
    const session = await getServerSession(handler);
    
    if (!session || !session.user) {
      console.error("No session found in Google auth callback");
      return new Response(JSON.stringify({ message: "No session found" }), {
        status: 401,
      });
    }

    const { email, googleId, firstName, lastName } = session.user;
 
    console.log("Google auth session:", { email, googleId, firstName, lastName });

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
        await user.save();
        console.log("Updated existing user with Google ID");
      } else {
        console.log("User already has Google ID");
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        googleId,
        firstName: firstName || "",
        lastName: lastName || "",
        provider: "google",
        password: "", // No password for Google users
      });
      console.log("Created new user from Google auth");
    }

    // Create JWT token
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      phone: user.phone,
      addPhone: user.addPhone,
      address: user.address,
      city: user.city,
      region:
        typeof user.region === "string"
          ? { name: user.region, fee: 0 }
          : user.region,
    });

    // Set cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return new Response(
      JSON.stringify({
        message: "Google authentication successful",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          phone: user.phone,
          addPhone: user.addPhone,
          address: user.address,
          city: user.city,
          region:
            typeof user.region === "string"
              ? { name: user.region, fee: 0 }
              : user.region,
        },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Google auth error:", error);
    return new Response(JSON.stringify({ message: "Authentication failed", error: error.message }), {
      status: 500,
    });
  }
}
