// lib/creatorAccess.js — who may see a creator dashboard, and for which codes.
// The role comes from the database rather than the 7-day login token, so switching someone's
// Creator role on or off in the admin console takes effect on their next request.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import PromoCode from "@/models/PromoCode";

const deny = (message, status) => ({ denied: NextResponse.json({ message }, { status }) });

/**
 * Creators get the codes linked to their account. Admins pass ?code=CODE to see any creator's.
 * Returns { user, promos, asAdmin } or { denied } (a response to send back).
 */
export async function creatorAccess(req) {
  const session = verifyToken(req.cookies.get("token")?.value);
  if (!session?.id) return deny("Unauthorized", 401);

  await connectDB();
  const user = await User.findById(session.id).select("role isActive firstName").lean();
  if (!user || user.isActive === false) return deny("Unauthorized", 401);

  if (user.role === "admin") {
    const code = String(new URL(req.url).searchParams.get("code") || "").trim().toUpperCase();
    if (!code) return deny("Open a creator's dashboard from Admin → Creators", 400);
    const promo = await PromoCode.findOne({ code, type: "creator" }).collation({ locale: "en", strength: 2 }).lean();
    if (!promo) return deny("Creator code not found", 404);
    return { user, promos: [promo], asAdmin: true };
  }

  if (user.role !== "creator") return deny("Forbidden", 403);
  const promos = await PromoCode.find({ type: "creator", creatorUser: user._id }).sort({ createdAt: 1 }).lean();
  return { user, promos, asAdmin: false };
}
