// app/api/webhook/route.js
import { NextResponse } from "next/server";
import { IS_PREVIEW } from "@/lib/analytics/env";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { countOrderSales } from "@/lib/soldCount";
import { countPromoUse } from "@/lib/promo";
import { sendOrderConfirmationEmails } from "@/lib/orderNotifications";
import { alertUnsavedOrder, loadCheckout, orderFieldsFrom } from "@/lib/paystackOrder";

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

  console.log('[Webhook] Metadata received:', typeof meta, JSON.stringify(meta, null, 2));

  if (!reference) {
    console.error("Webhook: missing reference");
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

  // ── 4. Build the order: our saved checkout first, Paystack's metadata as a fallback ──
  const checkout = await loadCheckout(reference, meta);
  const clientIdSource = checkout.data.clientIdSource || 'unknown';
  const orderData = orderFieldsFrom(checkout.data, { reference, amount: data.amount / 100 });

  console.log('[Webhook] Order details source:', checkout.source);
  console.log('[Webhook] gaClientId:', orderData.gaClientId, 'source:', clientIdSource);

  // ── 5. Save order ────────────────────────────────────────────────────────
  let order;
  try {
    order = await Order.create(orderData);

    console.log(`Webhook: order ${order._id} created for ${reference} with gaClientId:`, orderData.gaClientId);

    await countOrderSales(order._id);
    await countPromoUse(order.promoCode);
  } catch (err) {
    console.error(`Webhook: order save failed (details from ${checkout.source})`, err);
    // Someone paid and there's no order: email the admin with everything Paystack sent.
    // A duplicate key just means verify-payment saved it a moment earlier.
    if (err?.code !== 11000) {
      await alertUnsavedOrder({ reference, paystackData: data, error: err, source: checkout.source });
    }
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