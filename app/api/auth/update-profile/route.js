//api/auth/update-profile
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

// The only fields shoppers may change here. Everything else (role, email, password,
// isVerified, isActive, cart…) has its own route or is admin-only.
const EDITABLE_TEXT = ["firstName", "lastName", "phone", "addPhone", "address", "country", "city", "dob"];

// Never sent back to the browser
const PRIVATE_FIELDS =
  "-password -verificationToken -verificationTokenExpiry -resetPasswordCode -resetPasswordExpiry " +
  "-resetPasswordToken -resetPasswordTokenExpiry";

function pickEditable(body) {
  const updates = {};
  EDITABLE_TEXT.forEach((field) => {
    if (body[field] === undefined || body[field] === null) return;
    updates[field] = String(body[field]).trim().slice(0, 300);
  });
  if (body.region && typeof body.region === "object") {
    updates.region = {
      name: String(body.region.name || "").trim().slice(0, 100),
      fee: Number(body.region.fee) || 0,
    };
  }
  return updates;
}

export async function PUT(req) {
  await connectDB();

  const cookies = req.headers.get("cookie");
  const { token } = parse(cookies || "");
  const userData = token ? verifyToken(token) : null;
  if (!userData?.id)
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });

  const body = await req.json().catch(() => ({}));
  const updates = pickEditable(body || {});

  const user = await User.findByIdAndUpdate(userData.id, { $set: updates }, { new: true }).select(PRIVATE_FIELDS);
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  return Response.json({ user });
}
