// app/api/deals/route.js — the Black Friday flash deals for the storefront (lib/deals.js getDealCards):
// a preview before 27 Nov, live counts while they run (sold-out ones included), nothing after.
import { connectDB } from "@/lib/db";
import { blackFridayPhase } from "@/lib/blackFriday";
import { getDealCards } from "@/lib/deals";

export const dynamic = "force-dynamic";

export async function GET() {
  const phase = blackFridayPhase();
  if (phase === "over") return Response.json({ phase, deals: [] }, { headers: { "Cache-Control": "no-store" } });

  try {
    await connectDB();
    const cards = await getDealCards();
    // Short cache: "X left" only needs to be roughly current
    return Response.json(cards, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } });
  } catch (err) {
    console.error("Deals error:", err);
    return Response.json({ phase, deals: [] }, { status: 500 });
  }
}
