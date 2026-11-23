// app/api/deals/route.js — the Black Friday flash deals still available, for the popup, the
// header bar and product pages. { phase, deals: [{ id, title, type, percent, gift, left, products }] }
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { blackFridayPhase } from "@/lib/blackFriday";
import { dealPrice, dealSummary, getLiveDeals } from "@/lib/deals";
import { getFeaturedBundle } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const phase = blackFridayPhase();
  if (phase !== "live") return Response.json({ phase, deals: [] }, { headers: { "Cache-Control": "no-store" } });

  try {
    await connectDB();
    const deals = await getLiveDeals();
    const ids = [...new Set(deals.flatMap((d) => (d.products || []).map(String)))];
    const products = await Product.find({ _id: { $in: ids }, availability: { $ne: false } })
      .select("name image price colors")
      .lean();
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const out = deals
      .map((deal) => ({
        ...dealSummary(deal),
        products: (deal.products || [])
          .map((id) => byId.get(String(id)))
          .filter(Boolean)
          .map((p) => ({
            _id: String(p._id),
            name: p.name,
            image: p.image || p.colors?.[0]?.images?.[0] || "",
            price: p.price,
            dealPrice: deal.type === "discount" ? dealPrice(p.price, deal.percent) : p.price,
          })),
      }))
      .filter((d) => d.products.length > 0);

    // The bundle deal gets a slide in the popup too
    const bundle = await getFeaturedBundle();

    // Short cache: "X left" only needs to be roughly current
    return Response.json({ phase, deals: out, bundle }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } });
  } catch (err) {
    console.error("Deals error:", err);
    return Response.json({ phase, deals: [] }, { status: 500 });
  }
}
