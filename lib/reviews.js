// lib/reviews.js — verified-purchase reviews.
//
// Every delivered order item can be reviewed once. Buyers get a signed link per item
// by email (no account needed); signed-in buyers are recognised from their orders.
// Whether an item has been reviewed is read from the product's comments
// (comment.orderId), so there is no separate "reviewed" flag to keep in sync.
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.filstore.com.ng";
const LINK_TTL = "120d";
// Separate key so a review link can never be used as a login token (or vice versa)
const secret = () => `${process.env.JWT_SECRET}:review-links`;

// ─── Links ────────────────────────────────────────────────────────────────────

export function createReviewToken(orderId, productId) {
  return jwt.sign({ o: String(orderId), p: String(productId) }, secret(), { expiresIn: LINK_TTL });
}

export function reviewLink(orderId, productId) {
  return `${SITE_URL}/review/${createReviewToken(orderId, productId)}`;
}

// → { orderId, productId } or null when the link is invalid or expired
export function readReviewToken(token) {
  try {
    const { o, p } = jwt.verify(token, secret());
    if (!mongoose.isValidObjectId(o) || !mongoose.isValidObjectId(p)) return null;
    return { orderId: o, productId: p };
  } catch {
    return null;
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

// Online cart items carry the product id as `_id`; manual sales use `productId`
export const productIdOf = (item) => String(item.productId || item._id || "");

export const isDelivered = (order) =>
  String(order.status || "").toLowerCase() === "delivered" && (order.paymentStatus ?? "paid") === "paid";

// One entry per product (the same product in two colours is reviewed once)
export function reviewableItems(order) {
  const seen = new Set();
  return (order.items || []).filter((item) => {
    const id = productIdOf(item);
    if (!mongoose.isValidObjectId(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Product ids from this order that already have a review
export async function reviewedProductIds(orderId) {
  const products = await Product.find({ "comments.orderId": orderId }).select("_id").lean();
  return new Set(products.map((p) => String(p._id)));
}

// Items from a delivered order that still need a review
export async function unreviewedItems(order) {
  const reviewed = await reviewedProductIds(order._id);
  return reviewableItems(order).filter((item) => !reviewed.has(productIdOf(item)));
}

// The newest delivered order of this user's that contains the product, for marking
// a signed-in user's review as a verified purchase. → { orderId, color } or null
export async function findVerifiedPurchase(userId, productId) {
  if (!mongoose.isValidObjectId(userId)) return null;
  const ids = [productId, new mongoose.Types.ObjectId(productId)];
  const order = await Order.findOne({
    userId,
    status: { $regex: /^delivered$/i },
    $or: [{ "items._id": { $in: ids } }, { "items.productId": { $in: ids } }],
  })
    .sort({ createdAt: -1 })
    .lean();
  if (!order) return null;
  const item = order.items.find((i) => productIdOf(i) === String(productId));
  return { orderId: order._id, color: item?.color || "" };
}

// ─── Writing a review from a link ─────────────────────────────────────────────

export class ReviewError extends Error {}

// Loads everything the review page needs; throws ReviewError with a reason to show.
export async function loadReviewRequest(token) {
  const ref = readReviewToken(token);
  if (!ref) throw new ReviewError("This review link is invalid or has expired.");

  const [order, product] = await Promise.all([
    Order.findById(ref.orderId).lean(),
    Product.findById(ref.productId).select("name image colors").lean(),
  ]);
  if (!order || !product) throw new ReviewError("We couldn't find this order.");

  const item = reviewableItems(order).find((i) => productIdOf(i) === ref.productId);
  if (!item) throw new ReviewError("This product isn't part of that order.");
  if (!isDelivered(order)) throw new ReviewError("You can review this once your order has been delivered.");

  const alreadyReviewed = (await reviewedProductIds(order._id)).has(ref.productId);
  return { order, product, item, alreadyReviewed };
}

// Adds a pending, verified review. One per order item, enforced in the same write.
export async function submitLinkReview(token, { rating, text }) {
  const { order, product, item, alreadyReviewed } = await loadReviewRequest(token);
  if (alreadyReviewed) throw new ReviewError("You've already reviewed this product. Thank you!");

  const comment = {
    user: order.userId || null,
    authorName: order.firstName || "",
    text,
    rating,
    status: "pending",
    verified: true,
    orderId: order._id,
    color: item.color || "",
    createdAt: new Date(),
  };

  const filter = { _id: product._id, "comments.orderId": { $ne: order._id } };
  // A signed-in buyer who already reviewed from their account doesn't get a second one
  if (order.userId) filter["comments.user"] = { $ne: order.userId };

  const res = await Product.updateOne(filter, { $push: { comments: comment } });
  if (res.modifiedCount === 0) throw new ReviewError("You've already reviewed this product. Thank you!");
  return { productId: String(product._id) };
}
