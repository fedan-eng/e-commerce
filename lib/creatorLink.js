// lib/creatorLink.js — tying a creator promo code to an account from the promo code form.
// The customer page can do the same (PATCH /api/admin/users/[id]); this is the shortcut while
// creating or editing the code. Linking makes a shopper a creator and emails them.
import mongoose from "mongoose";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { buildCreatorLinkedEmail } from "@/lib/emails/creatorLinkedEmail";

/**
 * Reads body.creatorUser. Returns { skip } when it wasn't sent (leave the link alone),
 * { userId: null } to unlink, { userId, user } to link, or { error }.
 */
export async function parseCreatorUser(body, type) {
  if (type !== "creator") return { userId: null };
  if (body.creatorUser === undefined) return { skip: true };
  if (!body.creatorUser) return { userId: null };
  if (!mongoose.Types.ObjectId.isValid(body.creatorUser)) return { error: "Pick an account from the list" };

  const user = await User.findById(body.creatorUser).select("email firstName lastName role isActive").lean();
  if (!user) return { error: "That account no longer exists" };
  if (user.isActive === false) return { error: "That account is banned. Unban it before linking a code." };
  return { userId: user._id, user };
}

/**
 * After the code is saved: give a shopper the creator role and send the welcome email.
 * Only for a newly linked account. Admins keep their role (they can open /creator already).
 * Returns whether the email went out.
 */
export async function onCreatorLinked(promo, user) {
  if (user.role === "user") await User.updateOne({ _id: user._id }, { $set: { role: "creator" } });

  const { subject, html, text } = buildCreatorLinkedEmail({
    firstName: user.firstName,
    code: promo.code,
    discount: promo.discount,
    commissionPercent: promo.commissionPercent,
  });
  return Boolean(await sendEmail(user.email, subject, text, html).catch(() => null));
}
