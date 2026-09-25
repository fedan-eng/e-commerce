// lib/mergeCart.js
// Shared utility to merge visitor cart with user's DB cart
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function mergeVisitorCart(userId, visitorCart) {
  await connectDB();

  if (!Array.isArray(visitorCart) || visitorCart.length === 0) {
    return;
  }

  // Load existing user from DB
  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found for cart merge:", userId);
    return;
  }

  const dbItems = user.cart?.items || [];

  // Filter out invalid DB items (missing required fields)
  const validDbItems = dbItems.filter(item =>
    item && item._id && item.name && item.price !== undefined && item.image
  );

  // Build a map keyed by "_id|color" for O(1) lookup
  const merged = new Map(
    validDbItems.map(item => [`${item._id}|${item.color}`, { ...item }])
  );

  // Merge visitor cart items
  for (const visitorItem of visitorCart) {
    const key = `${visitorItem._id}|${visitorItem.color}`;
    if (merged.has(key)) {
      // Same product+color exists — add quantities
      merged.get(key).quantity += visitorItem.quantity;
    } else {
      // New item — add it
      merged.set(key, { ...visitorItem });
    }
  }

  const mergedItems = [...merged.values()];

  // Update user's cart in DB
  await User.findByIdAndUpdate(userId, {
    "cart.items": mergedItems,
    "cart.updatedAt": new Date(),
    "cart.abandonedEmailSent": false,
  });

  return mergedItems;
}
