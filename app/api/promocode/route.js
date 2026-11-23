// app/api/promocode/route.js
import { connectDB } from "@/lib/db";
import { sessionUserId, validatePromo } from "@/lib/promo";
import { BUNDLE_PROMO_MESSAGE } from "@/lib/bundles";

export async function POST(req) {
  await connectDB();

  try {
    // phone / email: the delivery details typed so far, so "first order only" is checked
    // against them now rather than only when they pay (/api/paystack checks again)
    const { code, cartValue, phone, email } = await req.json();
    const userId = await sessionUserId();

    // cartValue is the cart without bundle deals (lib/bundles.js); /api/paystack checks again
    if (!(Number(cartValue) > 0)) {
      return Response.json({ valid: false, message: BUNDLE_PROMO_MESSAGE }, { status: 400 });
    }

    const result = await validatePromo({
      code, userId, cartValue: Number(cartValue) || 0,
      phone: typeof phone === "string" ? phone : "", email: typeof email === "string" ? email : "",
    });
    if (!result.valid) {
      return Response.json({ valid: false, message: result.message }, { status: result.status });
    }

    return Response.json({
      valid: true,
      discount: result.percent,
      message: "Promo applied successfully",
    });
  } catch (err) {
    console.error("Promo validation error:", err);
    return Response.json(
      { valid: false, message: "Server error" },
      { status: 500 }
    );
  }
}
