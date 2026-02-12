// app/api/paystack/route.js (updated)
import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();

    // Destructure the cartItems and deliveryInfo from the body
    const { cartItems, deliveryInfo, discount } = body;

    // Destructure the nested deliveryInfo object
    const {
      firstName,
      email,
      phone,
      addPhone,
      region,
      city,
      deliveryType,
      address,
    } = deliveryInfo;

    // Validate
    if (
      !firstName ||
      !email ||
      !phone ||
      !region ||
      !city ||
      !deliveryType ||
      !address ||
      !cartItems ||
      cartItems.length === 0
    ) {
      return new Response(
        JSON.stringify({ message: "Missing required information" }),
        { status: 400 }
      );
    }

    // ✅ Always recompute on backend
    const subTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let deliveryFee = 0;
    if (deliveryType === "Free") {
      deliveryFee = 0;
    } else if (deliveryType === "Express") {
      deliveryFee = (region?.fee || 0) * 2;
    } else {
      deliveryFee = region?.fee || 0;
    }

    const safeDiscount = discount || 0;
    const total = subTotal - safeDiscount + deliveryFee;

    const amount = total * 100;

    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        metadata: {
          firstName,
          email,
          phone,
          addPhone,
          region,
          city,
          deliveryType,
          address,
          cartItems,
          subTotal,
          discount: safeDiscount,
          deliveryFee,
          total,
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return Response.json({
      authorization_url: res.data.data.authorization_url,
    });
  } catch (error) {
    console.error("Paystack Error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({ message: "Failed to initiate payment" }),
      { status: 500 }
    );
  }
}
