import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";
import jwt from "jsonwebtoken";

// 🔹 Middleware to check user from JWT (cookie-based auth)
async function authenticate(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // user id
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ message: "Missing fields" }), {
        status: 400,
      });
    }

    // 🔑 Authenticate user
    const userId = await authenticate(req);
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // ❌ Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Current password is incorrect" }),
        { status: 400 }
      );
    }

    // 🔒 Hash and update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // 📧 Send confirmation email
    await sendEmail(
      user.email,
      "Password Changed Successfully",
      "Your account password has been updated."
    );

    return new Response(
      JSON.stringify({ message: "Password changed successfully" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    });
  }
}
