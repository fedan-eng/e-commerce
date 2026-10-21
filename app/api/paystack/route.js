// app/api/paystack/route.js
import axios from "axios";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sessionUserId, validatePromo } from "@/lib/promo";
import { deliveryFeeFor, priceCart } from "@/lib/pricing";

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 14;
};

export async function POST(req) {

  const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || process.env.NEXT_PUBLIC_BASE_URL;
  try {
    const body = await req.json();

    // Handle both checkout modal (full) and checkout button (simple) formats
    const {
      cartItems: modalCartItems,
      deliveryInfo,
      promoCode,
      items: simpleItems,
      email: simpleEmail,
      address: simpleAddress,
      gaClientId,
      debugInfo,
    } = body;

    // Determine which format we're using
    const isSimpleCheckout = !deliveryInfo && simpleItems && simpleEmail;

    const finalCartItems = modalCartItems || simpleItems || [];
    // Who is buying comes from the session cookie, not the request body
    const finalUserId = await sessionUserId();

    // Log GA client_id for debugging (Vercel logs)
    console.log('[Paystack API] Received gaClientId:', gaClientId);
    console.log('[Paystack API] Client ID source:', debugInfo?.clientIdSource);
    console.log('[Paystack API] Full request body keys:', Object.keys(body));
    console.log('[Paystack API] Is simple checkout:', isSimpleCheckout);
    console.log('[Paystack API] Has deliveryInfo:', !!deliveryInfo);
    console.log('[Paystack API] Debug info from client:', debugInfo);

    // ── Server-side validation ──
    if (isSimpleCheckout) {
      // Simple checkout validation
      const email = String(simpleEmail || "").trim().toLowerCase();
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { message: "Invalid email address" },
          { status: 400 }
        );
      }

      // Prices come from the database, not the cart the browser sent
      await connectDB();
      const priced = await priceCart(finalCartItems);
      if (priced.error) {
        return NextResponse.json({ message: priced.error }, { status: 400 });
      }
      const { subTotal } = priced;
      const total = subTotal; // No delivery fee for simple checkout

      if (total <= 0) {
        return NextResponse.json(
          { message: "Invalid order total" },
          { status: 400 }
        );
      }

      // ── Call Paystack for simple checkout ──
      const paystackRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: email,
          amount: Math.round(total * 100),
          currency: "NGN",
          metadata: {
            cartItems: priced.items,
            userId: finalUserId,
            subTotal,
            discount: 0,
            deliveryFee: 0,
            total,
            simpleCheckout: true,
            gaClientId, // Pass GA client_id to webhook
            clientIdSource: debugInfo?.clientIdSource || 'unknown',
          },
          callback_url: `${origin}/checkout/success`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return NextResponse.json({
        authorization_url: paystackRes.data.data.authorization_url,
        reference: paystackRes.data.data.reference,
      });
    }

    // Full checkout modal validation
    if (!deliveryInfo) {
      return NextResponse.json(
        { message: "Delivery information is required" },
        { status: 400 }
      );
    }

    const email = String(deliveryInfo.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!isValidPhone(deliveryInfo.phone)) {
      return NextResponse.json(
        { message: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!deliveryInfo.firstName?.trim() || !deliveryInfo.lastName?.trim()) {
      return NextResponse.json(
        { message: "First and last name are required" },
        { status: 400 }
      );
    }

    if (!deliveryInfo.address?.trim() || !deliveryInfo.city?.trim()) {
      return NextResponse.json(
        { message: "Complete delivery address is required" },
        { status: 400 }
      );
    }

    // Prices, delivery fee and discount are all worked out here from the database;
    // the amounts in the browser's cart are ignored
    await connectDB();
    const priced = await priceCart(finalCartItems);
    if (priced.error) {
      return NextResponse.json({ message: priced.error }, { status: 400 });
    }
    const { subTotal } = priced;

    const delivery = await deliveryFeeFor(deliveryInfo.deliveryType, deliveryInfo.region?.name, subTotal);
    if (delivery.error) {
      return NextResponse.json({ message: delivery.error }, { status: 400 });
    }
    const deliveryFee = delivery.fee;

    let discount = 0;
    let appliedPromo = null;
    if (promoCode) {
      const promo = await validatePromo({ code: promoCode, userId: finalUserId, cartValue: subTotal });
      if (!promo.valid) {
        return NextResponse.json({ message: promo.message }, { status: promo.status });
      }
      discount = promo.amount;
      appliedPromo = promo.code;
    }

    const total = Math.max(0, subTotal - discount + deliveryFee);

    if (total <= 0) {
      return NextResponse.json(
        { message: "Invalid order total" },
        { status: 400 }
      );
    }

    // ── Call Paystack ──
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email, // sanitized email
        amount: Math.round(total * 100), // in kobo
        currency: "NGN",
        metadata: {
          cartItems: priced.items,
          deliveryInfo: {
            ...deliveryInfo,
            region: delivery.region,
            email,
            phone: String(deliveryInfo.phone).replace(/\D/g, ""),
          },
          promoCode: appliedPromo,
          subTotal,
          discount,
          deliveryFee,
          total,
          userId: finalUserId,
          gaClientId, // Pass GA client_id to webhook
          clientIdSource: debugInfo?.clientIdSource || 'unknown',
        },
        callback_url: `${origin}/checkout/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      authorization_url: paystackRes.data.data.authorization_url,
      reference: paystackRes.data.data.reference,
    });
  } catch (error) {
    console.error("Paystack Error:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Payment initiation failed" },
      { status: 500 }
    );
  }
}
