import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { completeVerification, sessionCookie } from "@/lib/verification";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url); 
  const token = searchParams.get("token");
  const callback = searchParams.get("callback");

  if (!token) {
    const redirectUrl = callback 
      ? `/login?error=missing_token&callback=${encodeURIComponent(callback)}`
      : "/login?error=missing_token";
    return Response.redirect(new URL(redirectUrl, req.url));
  }

  // Verify JWT token
  const decoded = verifyToken(token);
  if (!decoded) {
    const redirectUrl = callback 
      ? `/login?error=invalid_token&callback=${encodeURIComponent(callback)}`
      : "/login?error=invalid_token";
    return Response.redirect(new URL(redirectUrl, req.url));
  }

  // Find user by email from token
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    const redirectUrl = callback 
      ? `/login?error=user_not_found&callback=${encodeURIComponent(callback)}`
      : "/login?error=user_not_found";
    return Response.redirect(new URL(redirectUrl, req.url));
  }

  // Check if token matches and hasn't expired
  if (user.verificationToken !== token) {
    const redirectUrl = callback 
      ? `/login?error=token_mismatch&callback=${encodeURIComponent(callback)}`
      : "/login?error=token_mismatch";
    return Response.redirect(new URL(redirectUrl, req.url));
  }

  if (user.verificationTokenExpiry < new Date()) {
    const redirectUrl = callback 
      ? `/login?error=token_expired&callback=${encodeURIComponent(callback)}`
      : "/login?error=token_expired";
    return Response.redirect(new URL(redirectUrl, req.url));
  }

  // Check if already verified
  if (user.isVerified) {
    const redirectUrl = callback 
      ? `/login?error=already_verified&callback=${encodeURIComponent(callback)}`
      : "/login?error=already_verified";
    return Response.redirect(new URL(redirectUrl, req.url));
  }

  // Verify, send the WELCOME10 email, and sign them straight in
  await completeVerification(user);

  // Only same-site paths, so the link can't bounce people to another website
  const destination = callback && callback.startsWith("/") && !callback.startsWith("//") ? callback : "/";
  const response = NextResponse.redirect(new URL(destination, req.url));
  response.headers.set("Set-Cookie", sessionCookie(user));
  return response;
}
