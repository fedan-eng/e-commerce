// app/api/webhook/route.js
import { NextResponse } from "next/server";
import { IS_PREVIEW } from "@/lib/analytics/env";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { countOrderSales } from "@/lib/soldCount";
import { countPromoUse } from "@/lib/promo";
import { sendOrderConfirmationEmails } from "@/lib/orderNotifications";

// Helper function to send GA event via Measurement Protocol
async function sendGAEventViaMeasurementProtocol(order, gaClientId, clientIdSource) {
  try {
    if (IS_PREVIEW) {
      console.log('[GA] Preview deployment, skipping GA event');
      return false;
    }

    const measurementId = process.env.NEXT_PUBLIC_GA_ID;
    const apiSecret = process.env.GA_MEASUREMENT_PROTOCOL_SECRET;

    if (!measurementId || !apiSecret) {
      console.warn('[GA] Missing GA_MEASUREMENT_ID or GA_MEASUREMENT_PROTOCOL_SECRET, skipping GA event');
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

    console.log('[GA] Sending event via Measurement Protocol:', {
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
      console.error('[GA] Measurement Protocol request failed:', response.status, errorText);
      return false;
    }

    console.log('[GA] Measurement Protocol event sent successfully');
    return true;
  } catch (error) {
    console.error('[GA] Error sending GA event via Measurement Protocol:', error);
    return false;
  }
}

export async function POST(req) {
  const body = await req.text();

  // ── 1. Verify signature ──────────────────────────────────────────────────
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  if (hash !== req.headers.get("x-paystack-signature")) {
    console.error("Webhook: invalid signature");
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  console.log("Webhook event received:", event.event);

  // ── 2. Only handle charge.success ────────────────────────────────────────
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }
 
  const data = event.data;
  const meta = data.metadata;
  const reference = data.reference;
  // Paystack test-mode payments (e.g. from a preview deployment) never go to GA
  const isTestPayment = data.domain === "test";

  console.log('[Webhook] Full metadata received:', JSON.stringify(meta, null, 2));
  console.log('[Webhook] Metadata keys:', Object.keys(meta || {}));
  console.log('[Webhook] Has gaClientId in metadata:', !!meta?.gaClientId);

  if (!reference || !meta) {
    console.error("Webhook: missing reference or metadata");
    return NextResponse.json({ received: true });
  }

  await connectDB();

  // ── 3. Idempotency check ─────────────────────────────────────────────────
  const existing = await Order.findOne({ paymentReference: reference });
  if (existing) {
    console.log(`Webhook: order already exists for ${reference}, checking GA status`);

    // If order exists but GA hasn't been fired yet, try firing it now
    if (!existing.gaFired && existing.gaClientId && !isTestPayment) {
      console.log('[Webhook] Order exists but GA not fired, attempting now');
      const gaSuccess = await sendGAEventViaMeasurementProtocol(existing, existing.gaClientId, 'existing_order');

      if (gaSuccess) {
        try {
          await Order.findByIdAndUpdate(existing._id, { gaFired: true });
          console.log('[Webhook] GA event fired successfully for existing order');
        } catch (updateErr) {
          console.error('[Webhook] Failed to update gaFired flag on existing order:', updateErr);
        }
      }
    } else if (existing.gaFired) {
      console.log('[Webhook] GA already fired for existing order, skipping');
    }

    return NextResponse.json({ received: true });
  }

  // ── 4. Build orderData (mirrors verify-payment logic) ────────────────────
  const deliveryInfo = meta.deliveryInfo || meta;
  const isSimpleCheckout = meta.simpleCheckout || false;
  const gaClientId = meta.gaClientId || null;
  const clientIdSource = meta.clientIdSource || 'unknown';

  // Log GA client_id for debugging (Vercel logs)
  console.log(`[Webhook] Received gaClientId from metadata:`, gaClientId);
  console.log(`[Webhook] Client ID source:`, clientIdSource);
  console.log(`[Webhook] Is custom session ID:`, gaClientId?.startsWith('sess_'));

  const cartItems = (meta.cartItems || []).map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  const orderData = {
    userId: meta.userId || null,
    firstName: isSimpleCheckout ? "" : (deliveryInfo.firstName || ""),
    lastName: isSimpleCheckout ? "" : (deliveryInfo.lastName || ""),
    email: isSimpleCheckout ? (deliveryInfo.email || meta.email || "") : (deliveryInfo.email || ""),
    phone: isSimpleCheckout ? "" : (deliveryInfo.phone || ""),
    addPhone: isSimpleCheckout ? "" : (deliveryInfo.addPhone || ""),
    region: isSimpleCheckout ? { name: "", fee: 0 } : (deliveryInfo.region || { name: "", fee: 0 }),
    city: isSimpleCheckout ? "" : (deliveryInfo.city || ""),
    deliveryType: isSimpleCheckout ? "Regular" : (deliveryInfo.deliveryType || "Regular"),
    address: isSimpleCheckout ? "" : (deliveryInfo.address || ""),
    orderNote: isSimpleCheckout ? "" : (deliveryInfo.orderNote || ""),
    cartItems,
    subTotal: Number(meta.subTotal) || 0,
    discount: Number(meta.discount) || 0,
    deliveryFee: Number(meta.deliveryFee) || 0,
    total: Number(meta.total) || data.amount / 100,
    promoCode: meta.promoCode || null,
    referralCode: meta.referralCode || null,
    paymentMethod: "paystack",
    paymentReference: reference,
    paymentStatus: "paid",
    gaClientId, // Store GA client_id for server-side tracking
  };

  // ── 5. Save order ────────────────────────────────────────────────────────
  let order;
  try {
    order = await Order.create({
      userId: orderData.userId,
      email: orderData.email,
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      phone: orderData.phone,
      addPhone: orderData.addPhone,
      address: orderData.address,
      city: orderData.city,
      region: {
        name: orderData.region?.name || "",
        fee: orderData.region?.fee || 0,
      },
      deliveryType: orderData.deliveryType,
      orderNote: orderData.orderNote,
      items: orderData.cartItems,
      subTotal: orderData.subTotal,
      discount: orderData.discount,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      promoCode: orderData.promoCode,
      referralCode: orderData.referralCode,
      paymentMethod: orderData.paymentMethod,
      paymentReference: orderData.paymentReference,
      paymentStatus: orderData.paymentStatus,
      status: "confirmed",
      statusHistory: [{ status: "confirmed", date: new Date() }],
      gaClientId: orderData.gaClientId, // Store GA client_id
    });

    console.log(`Webhook: order ${order._id} created for ${reference} with gaClientId:`, orderData.gaClientId);

    await countOrderSales(order._id);
    await countPromoUse(order.promoCode);
  } catch (err) {
    console.error("Webhook: order save failed", err);
    // Return 200 so Paystack doesn't keep retrying
    return NextResponse.json({ received: true });
  }

  // ── 5.5 Fire GA event via Measurement Protocol (with idempotency check) ──
  if (!order.gaFired && orderData.gaClientId && !isTestPayment) {
    console.log('[Webhook] Attempting to fire GA event for order:', order._id);
    const gaSuccess = await sendGAEventViaMeasurementProtocol(order, orderData.gaClientId, clientIdSource);

    if (gaSuccess) {
      // Update order to mark GA as fired
      try {
        await Order.findByIdAndUpdate(order._id, { gaFired: true });
        console.log('[Webhook] GA event fired successfully and order updated');
      } catch (updateErr) {
        console.error('[Webhook] Failed to update gaFired flag:', updateErr);
        // Don't fail the webhook if the update fails
      }
    } else {
      console.warn('[Webhook] GA event failed to send, will retry on next webhook delivery');
    }
  } else if (order.gaFired) {
    console.log('[Webhook] GA event already fired for this order, skipping');
  } else {
    console.log('[Webhook] No gaClientId available, skipping GA event');
  }

  // ── 6. Send emails ────────────────────────────────────────────────────────
  try {
    await sendOrderConfirmationEmails(order);
    console.log("Webhook: emails sent successfully");
  } catch (err) {
    console.error("Webhook: email sending failed", err);
  }

  // ── 7. Respond 200 ────────────────────────────────────────────────────────
  return NextResponse.json({ received: true });
}