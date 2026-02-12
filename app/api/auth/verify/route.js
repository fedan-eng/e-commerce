import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import PendingVerification from "@/models/PendingVerification";

export async function POST(req) {
  await connectDB();
  const { email, code } = await req.json();

  const pending = await PendingVerification.findOne({ email });
  if (!pending) {
    return new Response(
      JSON.stringify({ message: "No pending verification for this email" }),
      { status: 404 }
    );
  }

  if (pending.verificationCode !== code) {
    return new Response(
      JSON.stringify({ message: "Invalid verification code" }),
      { status: 400 }
    );
  }

  if (pending.verificationCodeExpiry < new Date()) {
    await PendingVerification.deleteOne({ email });
    return new Response(
      JSON.stringify({ message: "Verification code expired" }),
      { status: 400 }
    );
  }

  const { firstName } = pending;

  // Create user
  await User.create({
    email: pending.email,
    password: pending.hashedPassword,
    isVerified: true,
  });

  // Send success email
  await sendEmail(
    email,
    "Welcome to Fil Store 🎉",
    `Hi ${firstName},
    
We’re so excited to welcome you to the Fedan Investment Limited (FIL) community! 🎉

At FIL, we don’t just make accessories – we believe in empowering people by giving them the tools they need to stay connected, productive, and unstoppable. Every product we create is built with care, empathy, and a drive to make your everyday life a little easier.

To celebrate you joining us, here’s a special gift:

👉 Enjoy 10% off your first order.
Use code WELCOME10 at checkout (valid for the next 14 days).

We’re not just here to sell to you—we’re here to grow with you. From power banks that keep you charged on the go, to accessories designed to fit seamlessly into your lifestyle, everything we do is about making sure you feel supported and valued.

Welcome aboard—we’re thrilled to have you with us!

Warm regards,
The FIL Team
Think Quality, Think FIL


`
  );

  // Remove pending verification record
  await PendingVerification.deleteOne({ email });

  return Response.json({
    message: "Email verified successfully, account created.",
  });
}
