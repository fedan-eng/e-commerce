// app/api/promocode/validate/route.js
import { connectDB } from "@/lib/db";
import PromoCode from "@/models/PromoCode";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(req) {
  await connectDB();

  try {
    const { code, userId, cartValue } = await req.json();

    // ✅ Check promo exists
    const promo = await PromoCode.findOne({ code });
    if (!promo) {
      return Response.json(
        { valid: false, message: "Invalid promo code" },
        { status: 400 }
      );
    }

    // ✅ Check user exists
    let user = null;
    if (userId) {
      // ✅ Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return Response.json(
          { valid: false, message: "Invalid userId format" },
          { status: 400 }
        );
      }

      user = await User.findById(userId);
      if (!user) {
        return Response.json(
          { valid: false, message: "User not found" },
          { status: 404 }
        );
      }
    }

    // ❌ Expiry check
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return Response.json(
        { valid: false, message: "Promo expired" },
        { status: 400 }
      );
    }

    // ❌ Minimum cart value
    if (cartValue < promo.minCartValue) {
      return Response.json(
        {
          valid: false,
          message: `Minimum cart value of ${promo.minCartValue} NGN required`,
        },
        { status: 400 }
      );
    }

    // ❌ Max usage limit
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return Response.json(
        { valid: false, message: "Promo usage limit reached" },
        { status: 400 }
      );
    }

    // ❌ First purchase only check (user must not have any orders)
    if (promo.firstPurchaseOnly) {
      const userOrders = await Order.findOne({ userId });
      if (userOrders) {
        return Response.json(
          { valid: false, message: "Promo valid only for first purchase" },
          { status: 400 }
        );
      }
    }

    // ❌ One-time per user check (has this user used this promo before?)
    if (promo.oneTimePerUser) {
      const usedBefore = await Order.findOne({ userId, promoCode: code });
      if (usedBefore) {
        return Response.json(
          { valid: false, message: "You have already used this promo" },
          { status: 400 }
        );
      }
    }

    // ✅ Passed all checks
    return Response.json({
      valid: true,
      discount: promo.discount,
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
