import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateCode } from "@/lib/utils";
import { sendEmail } from "@/lib/mailer";
import PendingVerification from "@/models/PendingVerification";

export async function POST(req) {
  await connectDB();
  const { email, password, firstName } = await req.json();

  const existingPending = await PendingVerification.findOne({ email });

  if (existingPending) {
    const isExpired = existingPending.verificationCodeExpiry < new Date();

if (!isExpired) {
  return new Response(
    JSON.stringify({ redirect: true, email }), // 👈 add email
    { status: 200 }                            // 👈 was 400, change to 200
  );
}

    // Code expired — delete the old record and allow re-registration
    await PendingVerification.deleteOne({ email });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const code = generateCode();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await PendingVerification.create({
    email,
    hashedPassword,
    verificationCode: code,
    verificationCodeExpiry: expiry,
    firstName,
  });

  await sendEmail(
    email,
    "Verify your email",
    `Hi ${firstName},

Welcome to Fedan Investment Limited (FIL)! To complete your signup, please verify your email address.

Your verification code is: ${code}

This code will expire in 10 minutes.

If you did not create an account with FIL, please ignore this message.

Thanks,
The FIL Team
Think Quality, Think FIL
`.trim()
  );

  return Response.json({ message: "Verification code sent to email" });
}
