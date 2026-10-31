// app/api/products/cart-counts/route.js
// GET ?ids=a,b,c → { counts: { a: "50+", b: null, ... } }
// How many signed-in users have each product in a cart touched in the last 90 days,
// rounded down to a friendly bucket. Guest carts live in the browser, so they aren't counted.
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const WINDOW_DAYS = 90;
const MAX_IDS = 20;
const BUCKETS = [100, 50, 25, 10]; // below 10 the tag is hidden

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map(); // key: sorted ids → { at, counts }

const bucketFor = (n) => {
  const b = BUCKETS.find((min) => n >= min);
  return b ? `${b}+` : null;
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ids = [...new Set((searchParams.get("ids") || "").split(","))]
    .filter((id) => /^[a-f0-9]{24}$/i.test(id))
    .slice(0, MAX_IDS)
    .sort();

  if (ids.length === 0) return Response.json({ counts: {} });

  const key = ids.join(",");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return Response.json({ counts: hit.counts });

  try {
    await connectDB();
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const rows = await User.aggregate([
      { $match: { "cart.items._id": { $in: ids }, "cart.updatedAt": { $gte: since } } },
      { $unwind: "$cart.items" },
      { $match: { "cart.items._id": { $in: ids } } },
      // One user counts once, even with the same product in two colours
      { $group: { _id: "$cart.items._id", users: { $addToSet: "$_id" } } },
      { $project: { count: { $size: "$users" } } },
    ]);

    const counts = Object.fromEntries(ids.map((id) => [id, null]));
    rows.forEach((r) => (counts[r._id] = bucketFor(r.count)));

    if (cache.size > 200) cache.clear(); // ids come from the query string — keep the map bounded
    cache.set(key, { at: Date.now(), counts });
    return Response.json({ counts });
  } catch (err) {
    console.error("Cart counts error:", err);
    // The tag is decoration — fail quietly so the section still renders
    return Response.json({ counts: {} });
  }
}
