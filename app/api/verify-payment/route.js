import axios from "axios";

export async function POST(req) {
  try {
    const { reference, provider } = await req.json();

    if (!reference || !provider) {
      return Response.json(
        { message: "Missing reference or provider" },
        { status: 400 }
      );
    }

    let verificationData;
    let orderData;

    if (provider === "paystack") {
      const res = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const paystackData = res.data.data;

      verificationData = {
        verified: paystackData.status === "success",
        provider: "paystack",
        amount: paystackData.amount / 100,
        reference: paystackData.reference,
      };

      orderData = {
        firstName: paystackData.metadata.firstName,
        lastName: paystackData.metadata.lastName || "",
        email: paystackData.metadata.email,
        phone: paystackData.metadata.phone,
        addPhone: paystackData.metadata.addPhone,
        region: paystackData.metadata.region,
        city: paystackData.metadata.city,
        deliveryType: paystackData.metadata.deliveryType,
        address: paystackData.metadata.address,
        cartItems: paystackData.metadata.cartItems,
        subTotal: paystackData.metadata.subTotal,
        discount: paystackData.metadata.discount,
        deliveryFee: paystackData.metadata.deliveryFee,
        total: paystackData.metadata.total,
        paymentMethod: "paystack",
        paymentReference: reference,
        paymentStatus: "paid",
      };

    } else if (provider === "flutterwave") {
      console.log("🔍 Verifying Flutterwave transaction ID:", reference);
      
      // Call to Flutterwave transaction verification endpoint
      const res = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      console.log("📦 Flutterwave Full API Response:", JSON.stringify(res.data, null, 2));

      // Verify response status
      if (res.data.status !== "success") {
        console.error("❌ Flutterwave API error:", res.data);
        return Response.json(
          { 
            verified: false, 
            message: res.data.message || "Transaction verification failed",
            provider: "flutterwave"
          },
          { status: 400 }
        );
      }

      const flutterwaveData = res.data.data;

      // Verify transaction status and currency
      const isVerified = 
        flutterwaveData.status === "successful" &&
        flutterwaveData.currency === "NGN" &&
        flutterwaveData.amount >= flutterwaveData.charged_amount;

      console.log("✅ Verification checks:", {
        transactionStatus: flutterwaveData.status,
        currency: flutterwaveData.currency,
        amount: flutterwaveData.amount,
        isVerified
      });

      verificationData = {
        verified: isVerified,
        provider: "flutterwave",
        amount: flutterwaveData.amount,
        reference: flutterwaveData.tx_ref,
        transactionId: flutterwaveData.id,
      };

      // Check if metadata exists and is valid
      if (!flutterwaveData.meta || Object.keys(flutterwaveData.meta).length === 0) {
        console.error("❌ No meta data found in Flutterwave response");
        return Response.json(
          { 
            verified: false, 
            message: "Order metadata missing. Please contact support.",
            provider: "flutterwave",
            debug: {
              hasCustomer: !!flutterwaveData.customer,
              status: flutterwaveData.status
            }
          },
          { status: 400 }
        );
      }

      // Parse and validate meta data
      let parsedCartItems = [];
      let parsedRegion = {};

      console.log("📋 Raw Meta Data:", flutterwaveData.meta);

      try {
        // Parse cartItems
        if (flutterwaveData.meta.cartItems) {
          if (typeof flutterwaveData.meta.cartItems === 'string') {
            parsedCartItems = JSON.parse(flutterwaveData.meta.cartItems);
          } else if (Array.isArray(flutterwaveData.meta.cartItems)) {
            parsedCartItems = flutterwaveData.meta.cartItems;
          }
        }

        // Parse region
        if (flutterwaveData.meta.region) {
          if (typeof flutterwaveData.meta.region === 'string') {
            parsedRegion = JSON.parse(flutterwaveData.meta.region);
          } else if (typeof flutterwaveData.meta.region === 'object') {
            parsedRegion = flutterwaveData.meta.region;
          }
        }
      } catch (e) {
        console.error("❌ Error parsing meta data:", e);
      }

      console.log("✅ Parsed Data:", {
        cartItemsCount: parsedCartItems.length,
        region: parsedRegion,
      });

      // Extract order data from parsed meta data
      orderData = {
        firstName: flutterwaveData.meta.firstName || 
                   flutterwaveData.customer?.name?.split(' ')[0] || "",
        lastName: flutterwaveData.meta.lastName || 
                  flutterwaveData.customer?.name?.split(' ').slice(1).join(' ') || "",
        email: flutterwaveData.meta.email || 
               flutterwaveData.customer?.email || "",
        phone: flutterwaveData.meta.phone || 
               flutterwaveData.customer?.phone_number || "",
        addPhone: flutterwaveData.meta.addPhone || "",
        region: parsedRegion,
        city: flutterwaveData.meta.city || "",
        deliveryType: flutterwaveData.meta.deliveryType || "Regular",
        address: flutterwaveData.meta.address || "",
        cartItems: parsedCartItems,
        subTotal: Number(flutterwaveData.meta.subTotal) || 0,
        discount: Number(flutterwaveData.meta.discount) || 0,
        deliveryFee: Number(flutterwaveData.meta.deliveryFee) || 0,
        total: Number(flutterwaveData.amount) || 0,
        paymentMethod: "flutterwave",
        paymentReference: flutterwaveData.tx_ref || reference,
        paymentStatus: "paid",
      };

      console.log("📦 Final Order Data:", {
        ...orderData,
        cartItems: `${orderData.cartItems.length} items`
      });

    } else {
      return Response.json(
        { message: "Invalid payment provider" },
        { status: 400 }
      );
    }

    if (verificationData.verified) {
      console.log("✅ Payment verified successfully:", {
        provider: verificationData.provider,
        reference: verificationData.reference,
        amount: verificationData.amount,
      });

      return Response.json({
        verified: true,
        message: "Payment verified successfully",
        provider: verificationData.provider,
        orderData: orderData,
      });
    } else {
      console.error("❌ Payment verification failed:", verificationData);

      return Response.json(
        { 
          verified: false, 
          message: "Payment verification failed",
          provider: verificationData.provider,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Verification Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });

    return Response.json(
      { 
        message: "Verification failed", 
        error: error.message,
        details: error.response?.data 
      },
      { status: 500 }
    );
  }
}
