// app/api/cart/prices/route.js — today's price for each product in a cart, so checkout shows
// what /api/paystack will actually charge (see lib/pricing.js).
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { cartItemExtras } from "@/lib/bundles";
import { dealsByProduct, getLiveDeals } from "@/lib/deals";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { ids } = await req.json();
    const valid = Array.isArray(ids) ? [...new Set(ids)].filter((id) => mongoose.isValidObjectId(id)).slice(0, 100) : [];

    await connectDB();
    const products = await Product.find({ _id: { $in: valid } }).select("name price originalPrice availability isBundle bundleItems features").lean();

    // { [productId]: { price, available, extras } }; ids missing from the reply are no longer sold.
    // extras: originalPrice and bundle details for the cart (lib/bundles.js)
    // During Black Friday the price is the deal price (lib/deals.js); /api/paystack works it out again
    const deals = dealsByProduct(await getLiveDeals());
    const prices = Object.fromEntries(
      products.map((p) => {
        const extras = cartItemExtras(p, p.isBundle ? null : deals.get(String(p._id)));
        return [String(p._id), { price: extras.price ?? p.price, available: p.availability !== false, extras }];
      })
    );
    return Response.json({ prices }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Cart prices error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
