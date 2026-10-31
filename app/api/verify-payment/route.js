// app/api/verify-payment/route.js
import axios from "axios";
import { IS_PREVIEW } from "@/lib/analytics/env";
import { sendOrderConfirmationEmails } from "@/lib/orderNotifications";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { countOrderSales } from "@/lib/soldCount";
import { countPromoUse } from "@/lib/promo";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";

// Helper function to send GA event via Measurement Protocol
async function sendGAEventViaMeasurementProtocol(order, gaClientId, clientIdSource) {
  try {
    if (IS_PREVIEW) {
      console.log('[GA Verify] Preview deployment, skipping GA event');
      return false;
    }

    const measurementId = process.env.NEXT_PUBLIC_GA_ID;
    const apiSecret = process.env.GA_MEASUREMENT_PROTOCOL_SECRET;

    if (!measurementId || !apiSecret) {
      console.warn('[GA Verify] Missing GA_MEASUREMENT_ID or GA_MEASUREMENT_PROTOCOL_SECRET, skipping GA event');
      return false;
    }

    const lineItems = (order.items || []).map((item, index) => ({
      item_id: String(item._id || item.productId || index),
      item_name: item.name || "Unknown",
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

    // Use custom session ID or generate random UUID as fallback
    const clientId = gaClientId || crypto.randomUUID();

    const payload = {
      client_id: clientId,
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: order.paymentReference || String(order._id),
            currency: "NGN",
            value: Number(order.total || 0),
            coupon: order.promoCode || undefined,
            shipping: Number(order.deliveryFee || 0),
            tax: 0,
            items: lineItems,
          },
        },
      ],
    };

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    console.log('[GA Verify] Sending event via Measurement Protocol:', {
      url: url.replace(apiSecret, '***'), // Log URL with secret masked
      client_id: clientId,
      client_id_source: clientIdSource,
      is_custom_session: clientId?.startsWith('sess_'),
      transaction_id: payload.events[0].params.transaction_id,
      value: payload.events[0].params.value,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GA Verify] Measurement Protocol request failed:', response.status, errorText);
      return false;
    }

    console.log('[GA Verify] Measurement Protocol event sent successfully');
    return true;
  } catch (error) {
    console.error('[GA Verify] Error sending GA event via Measurement Protocol:', error);
    return false;
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const { reference, provider } = await req.json();

    if (!reference || !provider) {
      return Response.json(
        { message: "Missing reference or provider" },
        { status: 400 }
      );
    }

    const cookie = req.cookies.get("token")?.value;
    let user = null;
    if (cookie) { 
      try {
        user = verifyToken(cookie);
      } catch (err) {
        console.error("Token verification error:", err);
      }
    }

    let verificationData;
    let orderData;
    let clientIdSource = 'unknown';

    // ── PAYSTACK ──────────────────────────────────────────────────────────────
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
      const meta = paystackData.metadata;

      verificationData = {
        verified: paystackData.status === "success",
        provider: "paystack",
        amount: paystackData.amount / 100,
        reference: paystackData.reference,
      };

      // Extract GA client_id from metadata
      const gaClientId = meta.gaClientId || null;
      clientIdSource = meta.clientIdSource || 'unknown'; // Update the shared variable
      console.log('[Verify Payment] Received gaClientId from Paystack metadata:', gaClientId);
      console.log('[Verify Payment] Client ID source:', clientIdSource);
      console.log('[Verify Payment] Is custom session ID:', gaClientId?.startsWith('sess_'));

      // Handle both old flat structure and new nested deliveryInfo structure
      const deliveryInfo = meta.deliveryInfo || meta;

      // Coerce all cart item numeric fields to numbers
      const cartItems = (meta.cartItems || []).map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }));

      orderData = {
        firstName: deliveryInfo.firstName || meta.firstName || "",
        lastName: deliveryInfo.lastName || meta.lastName || "",
        email: deliveryInfo.email || meta.email || "",
        phone: deliveryInfo.phone || meta.phone || "",
        addPhone: deliveryInfo.addPhone || meta.addPhone || "",
        region: deliveryInfo.region || meta.region || { name: "", fee: 0 },
        city: deliveryInfo.city || meta.city || "",
        deliveryType: deliveryInfo.deliveryType || meta.deliveryType || "Regular",
        gaClientId, // Include GA client_id
        address: deliveryInfo.address || meta.address || "",
        orderNote: deliveryInfo.orderNote || meta.orderNote || "",
        cartItems,
        subTotal: Number(meta.subTotal) || 0,
        discount: Number(meta.discount) || 0,
        deliveryFee: Number(meta.deliveryFee) || 0,
        total: Number(meta.total) || 0,
        promoCode: meta.promoCode || null,
        referralCode: meta.referralCode || null,
        paymentMethod: "paystack",
        paymentReference: reference,
        paymentStatus: "paid",
      };

    } else {
      return Response.json(
        { message: "Invalid payment provider" },
        { status: 400 }
      );
    }

    // ── GUARD: payment must be verified ──────────────────────────────────────
    if (!verificationData.verified) {
      return Response.json(
        {
          verified: false,
          message: "Payment verification failed",
          provider: verificationData.provider,
        },
        { status: 400 }
      );
    }

    // ── SAVE ORDER ────────────────────────────────────────────────────────────
    let order;

    try {
      // Before creating, checkif order already exists
      const existingOrder = await Order.findOne({ 
        paymentReference: orderData.paymentReference 
      });

      if (existingOrder) {
        // Webhook already saved it — return data, skip emails
        return Response.json({
          verified: true,
          message: "Payment already verified and order exists",
          provider: verificationData.provider,
          orderData,
          order: existingOrder,
        });
      }

      // Doesn't exist yet — create it
      order = await Order.create({
        userId: user?.id || null,
        email: orderData.email,
        address: orderData.address,
        region: {
          name: orderData.region?.name || orderData.region,
          fee: orderData.region?.fee || orderData.deliveryFee,
        },
        city: orderData.city,
        deliveryType: orderData.deliveryType,
        phone: orderData.phone,
        addPhone: orderData.addPhone || "",
        firstName: orderData.firstName,
        lastName: orderData.lastName || "",
        orderNote: orderData.orderNote || "", 
        items: orderData.cartItems,
        subTotal: orderData.subTotal,
        discount: orderData.discount,
        promoCode: orderData.promoCode || null,
        referralCode: orderData.referralCode || null,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        paymentReference: orderData.paymentReference,
        paymentStatus: orderData.paymentStatus,
        status: "confirmed",
        statusHistory: [{ status: "confirmed", date: new Date() }],
        gaClientId: orderData.gaClientId, // Store GA client_id
      });

      console.log('[Verify Payment] Order created with gaClientId:', orderData.gaClientId);

      await countOrderSales(order._id);
      await countPromoUse(order.promoCode);

      // ── Fire GA event via Measurement Protocol (backup case) ──
      if (orderData.gaClientId && !order.gaFired) {
        console.log('[Verify Payment] Attempting to fire GA event for order:', order._id);
        const gaSuccess = await sendGAEventViaMeasurementProtocol(order, orderData.gaClientId, clientIdSource);

        if (gaSuccess) {
          try {
            await Order.findByIdAndUpdate(order._id, { gaFired: true });
            console.log('[Verify Payment] GA event fired successfully and order updated');
          } catch (updateErr) {
            console.error('[Verify Payment] Failed to update gaFired flag:', updateErr);
          }
        } else {
          console.warn('[Verify Payment] GA event failed to send');
        }
      } else if (order.gaFired) {
        console.log('[Verify Payment] GA event already fired for this order, skipping');
      } else {
        console.log('[Verify Payment] No gaClientId available, skipping GA event');
      }

      if (!order) {
        return Response.json({ message: "Order save failed" }, { status: 500 });
      }
    } catch (e) {
      console.error("Error saving order:", e);
      return Response.json({ message: "Order save failed" }, { status: 500 });
    }

    // ── Send emails ───────────────────────────────────────────────────────────
    try {
      await sendOrderConfirmationEmails(order);
      console.log("Emails sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return Response.json({
      verified: true,
      message: "Payment verified and order created successfully",
      provider: verificationData.provider,
      orderData,
      order,
    });

  } catch (error) {
    console.error("Verification Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return Response.json(
      {
        message: "Verification failed",
        error: error.message,
        details: error.response?.data,
      },
      { status: 500 }
    );
  }
}