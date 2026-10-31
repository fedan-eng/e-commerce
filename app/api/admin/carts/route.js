// app/api/admin/carts/route.js
// GET → what's sitting in signed-in shoppers' carts right now, per product.
// Guest carts live in the browser, so they aren't counted.
// "Abandoned" matches the users API and the dashboard alert: not touched for 48 hours.

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ABANDONED_MS = 48 * 60 * 60 * 1000;
const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return Response.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE });
    const user = verifyToken(token);
    if (user.role !== "admin") return Response.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE });

    await connectDB();
    const cutoff = new Date(Date.now() - ABANDONED_MS);
    // A cart never stamped with updatedAt counts as active, same as the users API
    const isAbandoned = { $lt: [{ $ifNull: ["$cart.updatedAt", "$$NOW"] }, cutoff] };

    const [result] = await User.aggregate([
      { $match: { "cart.items.0": { $exists: true } } },
      { $project: { items: "$cart.items", abandoned: isAbandoned } },
      {
        $facet: {
          carts: [
            { $group: { _id: null, total: { $sum: 1 }, abandoned: { $sum: { $cond: ["$abandoned", 1, 0] } } } },
          ],
          products: [
            { $unwind: "$items" },
            {
              $group: {
                _id: { product: "$items._id", user: "$_id" },
                name: { $first: "$items.name" },
                image: { $first: "$items.image" },
                abandoned: { $first: "$abandoned" },
                units: { $sum: { $ifNull: ["$items.quantity", 1] } },
                value: { $sum: { $multiply: [{ $ifNull: ["$items.price", 0] }, { $ifNull: ["$items.quantity", 1] }] } },
              },
            },
            // One shopper counts once per product, even with the same product in two colours
            {
              $group: {
                _id: "$_id.product",
                name: { $first: "$name" },
                image: { $first: "$image" },
                carts: { $sum: 1 },
                abandoned: { $sum: { $cond: ["$abandoned", 1, 0] } },
                units: { $sum: "$units" },
                value: { $sum: "$value" },
              },
            },
            { $sort: { carts: -1, value: -1 } },
          ],
        },
      },
    ]);

    const carts = result.carts[0] || { total: 0, abandoned: 0 };
    const products = result.products.map(({ _id, ...p }) => ({ id: _id, ...p }));
    const summary = {
      carts: carts.total,
      abandonedCarts: carts.abandoned,
      units: products.reduce((a, p) => a + p.units, 0),
      value: products.reduce((a, p) => a + p.value, 0),
    };

    return Response.json({ summary, products }, { headers: NO_STORE });
  } catch (err) {
    console.error("[admin/carts GET]", err);
    return Response.json({ message: "Server error" }, { status: 500, headers: NO_STORE });
  }
}
