// app/api/flutterwave/route.js
import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();

    const { cartItems, deliveryInfo, discount } = body;

    const {
      firstName,
      lastName,
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
      return Response.json(
        { message: "Missing required information" },
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

    // Generate unique transaction reference
    const tx_ref = `FLW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log("🚀 Initiating Flutterwave payment:", {
      tx_ref,
      amount: total,
      customer: email
    });

    const payload = {
      tx_ref: tx_ref,
      amount: total,
      currency: "NGN",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      customer: {
        email,
        phonenumber: phone,
        name: `${firstName} ${lastName || ''}`.trim(),
      },
      customizations: {
        title: "FIL Store",
        description: "Payment for order",
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
      meta: {
        firstName: firstName,
        lastName: lastName || "",
        email: email,
        phone: phone,
        addPhone: addPhone || "",
        region: JSON.stringify(region),
        city: city,
        deliveryType: deliveryType,
        address: address,
        cartItems: JSON.stringify(cartItems),
        subTotal: subTotal.toString(),
        discount: safeDiscount.toString(),
        deliveryFee: deliveryFee.toString(),
        total: total.toString(),
      },
    };

    console.log("📦 Flutterwave Payload Meta:", payload.meta);

    const res = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Fixed: Use the tx_ref you generated, not from response
    console.log("✅ Flutterwave Response:", {
      status: res.data.status,
      message: res.data.message,
      link: res.data.data.link,
      tx_ref: tx_ref  // ✅ Use the one you created
    });

    return Response.json({
      authorization_url: res.data.data.link,
      tx_ref: tx_ref,  // ✅ Return the one you created
    });
    
  } catch (error) {
    console.error("❌ Flutterwave Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return Response.json(
      { 
        message: "Failed to initiate payment",
        error: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}
  