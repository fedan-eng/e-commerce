// app/api/ref/route.js
// POST { code, type: "click" | "cart", visitorId?, path? } from lib/referral.js.
// Checks the creator code and, when a visitorId is sent (analytics allowed), logs the event once
// per visitor per day. Replies { valid, code, discount, creatorName } so the link can be remembered.
import { connectDB } from "@/lib/db";
import ReferralEvent from "@/models/ReferralEvent";
import { findCreatorCode } from "@/lib/promoCodes";

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse/i;
const VISITOR_RE = /^[A-Za-z0-9-]{8,64}$/;

function deviceOf(ua) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

const lagosDay = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const type = body.type === "cart" ? "cart" : "click";

  try {
    await connectDB();
    const promo = await findCreatorCode(body.code);
    if (!promo) return Response.json({ valid: false });

    const ua = req.headers.get("user-agent") || "";
    const visitorId = String(body.visitorId || "");
    if (VISITOR_RE.test(visitorId) && !BOT_RE.test(ua)) {
      const key = { code: promo.code, type, visitorId, day: lagosDay() };
      await ReferralEvent.updateOne(
        key,
        { $setOnInsert: { ...key, device: deviceOf(ua), path: type === "click" ? String(body.path || "/").slice(0, 200) : "" } },
        { upsert: true }
      ).catch((err) => {
        if (err.code !== 11000) throw err; // two tabs at once: the other one already logged it
      });
    }

    return Response.json({ valid: true, ...promo });
  } catch (err) {
    console.error("[ref POST]", err);
    return Response.json({ valid: false }, { status: 500 });
  }
}
