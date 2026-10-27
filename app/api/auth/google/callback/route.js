import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { buildWelcomeEmail } from "@/lib/emails/welcomeEmail";
import { serialize } from "cookie";
import { mergeVisitorCart } from "@/lib/mergeCart";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Decode callbackUrl from state
  let callbackUrl = "/";
  try {
    const decoded = JSON.parse(Buffer.from(rawState, "base64url").toString());
    callbackUrl = decoded.callbackUrl || "/";
  } catch {
    callbackUrl = "/";
  }

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${tokenData.error}`);
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();

    await connectDB();

    let user = await User.findOne({ googleId: googleUser.id });
    let isNewUser = false;

    if (!user) {
      const existingUser = await User.findOne({ email: googleUser.email });

      if (existingUser) {
        return NextResponse.redirect(
          `${baseUrl}/login?error=email_exists&hint=use_password`
        );
      }

      const nameParts = googleUser.name.split(" ");
      const firstName = nameParts[0] || "";
      user = await User.create({
        email: googleUser.email,
        googleId: googleUser.id,
        provider: "google",
        firstName,
        lastName: nameParts.slice(1).join(" ") || "",
        isActive: true,
      });

      isNewUser = true;
      // Send welcome email in background, don't block the auth flow
      sendGoogleWelcomeEmail(googleUser.email, firstName).catch(err => {
        console.error("Failed to send welcome email:", err);
      });
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    const cookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const response = NextResponse.redirect(`${baseUrl}${callbackUrl}`);
    response.headers.set("Set-Cookie", cookie);

    // Check for visitor cart cookie and merge
    const rawCart = req.cookies.get("visitor_cart")?.value;
    if (rawCart) {
      try {
        const visitorCart = JSON.parse(decodeURIComponent(rawCart));
        if (visitorCart.length > 0) {
          await mergeVisitorCart(user._id, visitorCart);
        }
      } catch (e) {
        console.error("Cart cookie parse failed:", e);
      }
      // Clear the cookie by setting it with expired date
      const clearCookie = serialize("visitor_cart", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      response.headers.append("Set-Cookie", clearCookie);
    }

    // Set flag for new Google users (readable by client)
    if (isNewUser) {
      const newGoogleUserCookie = serialize("newGoogleUser", "true", {
        httpOnly: false, // Allow client-side access
        path: "/",
        maxAge: 60 * 60, // 1 hour
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      response.headers.append("Set-Cookie", newGoogleUserCookie);
    }

    return response;

  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
  }
}

async function sendGoogleWelcomeEmail(email, firstName) {
  const { subject, html, text } = buildWelcomeEmail({ firstName });
  await sendEmail(email, subject, text, html);
}