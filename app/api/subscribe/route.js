// app/api/subscribe/route.js — promo popup sign-up. Adds the email to the newsletter and creates
// the FIL account behind the scenes (generated password), then emails a 6-digit code to verify.
// Verifying signs them in and sends the WELCOME10 email (see /api/auth/verify-code).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { subscribeContact } from "@/lib/brevo";
import { buildAccountCreatedEmail } from "@/lib/emails/accountCreatedEmail";
import { baseUrlFrom, findUserByEmail, generatePassword, issueVerification } from "@/lib/verification";
import User from "@/models/User";

// "+2348137678990" → "08137678990" (how checkout stores Nigerian numbers); other countries keep their code
const accountPhone = (e164) => (e164.startsWith("+234") ? `0${e164.slice(4)}` : e164.slice(1));

export async function POST(req) {
  try {
    const { email: rawEmail, phone: rawPhone, smsOptIn } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Optional phone in E.164 form (e.g. +2348137678990), sent by the promo popup
    const phone =
      typeof rawPhone === "string" && /^\+\d{8,16}$/.test(rawPhone) ? rawPhone : null;

    // Newsletter list in Brevo. Not fatal: the account below is what unlocks the code.
    try {
      await subscribeContact({ email, phone, smsOptIn: smsOptIn === true });
    } catch (err) {
      console.error("Brevo subscribe failed:", err.message);
    }

    await connectDB();
    let user = await findUserByEmail(User, email);

    if (user && (user.isVerified || user.googleId)) {
      return NextResponse.json(
        { message: "You already have a FIL account. Sign in and use WELCOME10 at checkout.", hasAccount: true },
        { status: 409 }
      );
    }

    // A password is only emailed when we made it. An unverified popup account has never
    // been signed in to, so a fresh one is safe; someone who registered keeps their own.
    let password = null;
    if (!user) {
      password = generatePassword();
      user = new User({
        email,
        password: bcrypt.hashSync(password, 10),
        provider: "local",
        isVerified: false,
        passwordIsGenerated: true,
      });
    } else if (user.passwordIsGenerated) {
      password = generatePassword();
      user.password = bcrypt.hashSync(password, 10);
    }
    if (phone && !user.phone) user.phone = accountPhone(phone);

    const { code, link } = issueVerification(user, baseUrlFrom(req));
    await user.save();

    const { subject, html, text } = buildAccountCreatedEmail({ email: user.email, password, code, link });
    await sendEmail(user.email, subject, text, html);

    return NextResponse.json({ message: "We've emailed you a 6-digit code.", email: user.email });
  } catch (error) {
    console.error("Subscription Error: ", error);
    return NextResponse.json(
      { message: "Something went wrong. Try again!" },
      { status: 500 }
    );
  }
}
