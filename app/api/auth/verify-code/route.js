// app/api/auth/verify-code/route.js — checks a 6-digit email code and signs the shopper in.
// For a new account it also verifies the email and sends the WELCOME10 email; for an existing
// account it's a sign-in without a password (codes from /api/auth/login-code).
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  checkVerificationCode,
  clearCode,
  completeVerification,
  findUserByEmail,
  sessionCookie,
} from "@/lib/verification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email: rawEmail, code } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email || !/^\d{6}$/.test(String(code || "").trim())) {
      return NextResponse.json({ message: "Please enter the 6-digit code from your email." }, { status: 400 });
    }

    await connectDB();
    const user = await findUserByEmail(User, email);
    if (!user) {
      return NextResponse.json({ message: "Please request a new code." }, { status: 400 });
    }
    if (user.isActive === false) {
      return NextResponse.json({ message: "Your account has been suspended. Please contact support." }, { status: 403 });
    }

    const error = checkVerificationCode(user, code);
    if (error) {
      await user.save(); // keep the attempt count
      return NextResponse.json({ message: error }, { status: 400 });
    }

    // New email signups get verified (and the WELCOME10 email); Google accounts were
    // already proven by Google, so they're just marked verified quietly.
    const isNewSignup = !user.isVerified && !user.googleId;
    if (isNewSignup) {
      await completeVerification(user);
    } else {
      user.isVerified = true;
      clearCode(user);
      await user.save();
    }

    const res = NextResponse.json({ message: isNewSignup ? "Email verified" : "Signed in", isNewSignup });
    res.headers.set("Set-Cookie", sessionCookie(user));
    return res;
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
