// app/api/paystack/route.js
import axios from "axios";
import { NextResponse } from "next/server";

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

    const { 
      cartItems: modalCartItems, 
      deliveryInfo, 
      discount = 0, 
      promoCode, 
      userId, 
      items: simpleItems, 
      email: simpleEmail, 
    } = body;

    const isSimpleCheckout = !deliveryInfo && simpleItems && simpleEmail;
    const finalCartItems = modalCartItems || simpleItems || [];
    const finalUserId = userId || null;

    // ── Simple Checkout ──────────────────────────────────────────────────────
    if (isSimpleCheckout) {
      const email = String(simpleEmail || "").trim().toLowerCase();

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { message: "Invalid email address" },
          { status: 400 }
        );
      }

      if (!Array.isArray(finalCartItems) || finalCartItems.length === 0) {
        return NextResponse.json(
          { message: "Cart is empty" },
          { status: 400 }
        );
      }

      const subTotal = finalCartItems.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0
      );
      const total = subTotal;

      if (total <= 0) {
        return NextResponse.json(
          { message: "Invalid order total" },
          { status: 400 }
        );
      }

      const paystackRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: Math.round(total * 100),
          currency: "NGN",
          metadata: {
            cartItems: finalCartItems,
            userId: finalUserId,
            email, // ← fix: included so webhook can read it
            subTotal,
            discount: 0,
            deliveryFee: 0,
            total,
            simpleCheckout: true,
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

    // ── Full Checkout ─────────────────────────────────────────────────────────
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

    if (!Array.isArray(finalCartItems) || finalCartItems.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    const subTotal = finalCartItems.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );

    const deliveryFee =
      deliveryInfo.deliveryType === "Free"
        ? 0
        : deliveryInfo.deliveryType === "Express"
        ? (deliveryInfo.region?.fee || 0) * 2
        : deliveryInfo.region?.fee || 0;

    const total = Math.max(0, subTotal - Number(discount) + deliveryFee);

    if (total <= 0) {
      return NextResponse.json(
        { message: "Invalid order total" },
        { status: 400 }
      );
    }

    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(total * 100),
        currency: "NGN",
        metadata: {
          cartItems: finalCartItems,
          deliveryInfo: {
            ...deliveryInfo,
            email,
            phone: String(deliveryInfo.phone).replace(/\D/g, ""),
          },
          promoCode,
          subTotal,
          discount,
          deliveryFee,
          total,
          userId: finalUserId,
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