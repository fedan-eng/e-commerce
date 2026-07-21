// app/api/verify-payment/route.js
import axios from "axios";
import { sendEmail } from "@/lib/mailer";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";

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

    // ── AUTH (optional) ──────────────────────────────────────────────────────
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

    // ── PAYSTACK ─────────────────────────────────────────────────────────────
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
      const meta = paystackData.metadata || {};

      verificationData = {
        verified: paystackData.status === "success",
        provider: "paystack",
        amount: paystackData.amount / 100,
        reference: paystackData.reference,
      };

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
        deliveryType:
          deliveryInfo.deliveryType || meta.deliveryType || "Regular",
        address: deliveryInfo.address || meta.address || "",
        orderNote: deliveryInfo.orderNote || meta.orderNote || "",
        cartItems,
        subTotal: Number(meta.subTotal) || 0,
        discount: Number(meta.discount) || 0,
        deliveryFee: Number(meta.deliveryFee) || 0,
        total: Number(meta.total) || 0,
        promoCode: meta.promoCode || null,
        paymentMethod: "paystack",
        paymentReference: reference,
        paymentStatus: "paid",
      };

      // ── FLUTTERWAVE ────────────────────────────────────────────────────────
    } else if (provider === "flutterwave") {
      const res = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      if (res.data.status !== "success") {
        return Response.json(
          {
            verified: false,
            message: res.data.message || "Transaction verification failed",
            provider: "flutterwave",
          },
          { status: 400 }
        );
      }

      const flutterwaveData = res.data.data;

      const isVerified =
        flutterwaveData.status === "successful" &&
        flutterwaveData.currency === "NGN" &&
        flutterwaveData.amount >= flutterwaveData.charged_amount;

      verificationData = {
        verified: isVerified,
        provider: "flutterwave",
        amount: flutterwaveData.amount,
        reference: flutterwaveData.tx_ref,
        transactionId: flutterwaveData.id,
      };

      if (
        !flutterwaveData.meta ||
        Object.keys(flutterwaveData.meta).length === 0
      ) {
        return Response.json(
          {
            verified: false,
            message: "Order metadata missing. Please contact support.",
            provider: "flutterwave",
          },
          { status: 400 }
        );
      }

      let parsedCartItems = [];
      let parsedRegion = {};

      try {
        if (flutterwaveData.meta.cartItems) {
          const raw =
            typeof flutterwaveData.meta.cartItems === "string"
              ? JSON.parse(flutterwaveData.meta.cartItems)
              : flutterwaveData.meta.cartItems;
          parsedCartItems = raw.map((item) => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          }));
        }
        if (flutterwaveData.meta.region) {
          parsedRegion =
            typeof flutterwaveData.meta.region === "string"
              ? JSON.parse(flutterwaveData.meta.region)
              : flutterwaveData.meta.region;
        }
      } catch (e) {
        console.error("Error parsing meta data:", e);
      }

      orderData = {
        firstName:
          flutterwaveData.meta.firstName ||
          flutterwaveData.customer?.name?.split(" ")[0] ||
          "",
        lastName:
          flutterwaveData.meta.lastName ||
          flutterwaveData.customer?.name?.split(" ").slice(1).join(" ") ||
          "",
        email:
          flutterwaveData.meta.email || flutterwaveData.customer?.email || "",
        phone:
          flutterwaveData.meta.phone ||
          flutterwaveData.customer?.phone_number ||
          "",
        addPhone: flutterwaveData.meta.addPhone || "",
        region: parsedRegion,
        city: flutterwaveData.meta.city || "",
        deliveryType: flutterwaveData.meta.deliveryType || "Regular",
        address: flutterwaveData.meta.address || "",
        orderNote: flutterwaveData.meta.orderNote || "",
        cartItems: parsedCartItems,
        subTotal: Number(flutterwaveData.meta.subTotal) || 0,
        discount: Number(flutterwaveData.meta.discount) || 0,
        promoCode: flutterwaveData.meta.promoCode || null,
        deliveryFee: Number(flutterwaveData.meta.deliveryFee) || 0,
        total: Number(flutterwaveData.amount) || 0,
        paymentMethod: "flutterwave",
        paymentReference: flutterwaveData.tx_ref || reference,
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

    // ── SAVE ORDER ───────────────────────────────────────────────────────────
    let order;
    let isExistingOrder;

    try {
      const result = await Order.findOneAndUpdate(
        { paymentReference: orderData.paymentReference },
        {
          $setOnInsert: {
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
            deliveryFee: orderData.deliveryFee,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod,
            paymentReference: orderData.paymentReference,
            paymentStatus: orderData.paymentStatus,
            status: "Confirmed",
            statusHistory: [{ status: "Confirmed", date: new Date() }],
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          rawResult: true,
        }
      );

      isExistingOrder = result.lastErrorObject?.updatedExisting === true;
      order = result.value;

      if (!order) {
        order = await Order.findOne({
          paymentReference: orderData.paymentReference,
        });
      }

      if (!order) {
        return Response.json({ message: "Order save failed" }, { status: 500 });
      }

      // Duplicate call — return early, don't resend emails
      if (isExistingOrder) {
        return Response.json({
          verified: true,
          message: "Payment already verified and order exists",
          provider: verificationData.provider,
          orderData,
          order,
        });
      }
    } catch (e) {
      console.error("Error saving order:", e);
      return Response.json({ message: "Order save failed" }, { status: 500 });
    }

    // ── SHARED EMAIL HELPERS ─────────────────────────────────────────────────
    const hasColor = orderData.cartItems.some((item) => item.color);
    const regionName = orderData.region?.name || orderData.region || "";
    const orderedAt = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Shared item rows
    const itemRowsHtml = orderData.cartItems
      .map(
        (item) => `
        <tr>
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; vertical-align:top;">${item.name}</td>
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:center; vertical-align:top;">${item.quantity}</td>
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right; vertical-align:top;">&#x20A6;${Number(item.price).toLocaleString()}</td>
          ${hasColor ? `<td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:center; vertical-align:top;">${item.color || "-"}</td>` : ""}
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#333333; text-align:right; vertical-align:top;">&#x20A6;${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    // Shared table header
    const itemsTableHeader = `
      <tr style="background-color:#0fa968;">
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:left; border:none;">Item</th>
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:center; border:none; white-space:nowrap;">Qty</th>
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:right; border:none; white-space:nowrap;">Unit Price</th>
        ${hasColor ? `<th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:center; border:none;">Color</th>` : ""}
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:right; border:none; white-space:nowrap;">Total</th>
      </tr>`;

    // Shared summary rows
    const summaryRowsHtml = `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566;">Subtotal</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#333333; text-align:right;">&#x20A6;${Number(orderData.subTotal).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566;">Delivery Fee</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#333333; text-align:right;">&#x20A6;${Number(orderData.deliveryFee).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>
      ${
        orderData.discount > 0
          ? `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#0a7a4a; font-weight:600;">Discount</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#0a7a4a; font-weight:600; text-align:right;">-&#x20A6;${Number(orderData.discount).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>`
          : ""
      }
      ${
        orderData.promoCode
          ? `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566;">Promo Code</td>
            <td style="text-align:right;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr>
                <td style="background-color:#f0faf5; color:#0a7a4a; padding:3px 12px; border-radius:10px; font-family:'Courier New',Courier,monospace; font-size:12px; font-weight:700; border:1px dashed #0a7a4a;">${orderData.promoCode}</td>
              </tr></table>
            </td>
          </tr></table>
        </td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:16px 0 4px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:17px; font-weight:700; color:#0a7a4a;">Total Amount</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:20px; font-weight:800; color:#0a7a4a; text-align:right;">&#x20A6;${Number(orderData.total).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>`;

    // Shared email head
    const emailHead = (title) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body { margin:0 !important; padding:0 !important; background-color:#f0f2f5 !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    :root { color-scheme: light only; }
    @media only screen and (max-width:620px) {
      .email-card { width:100% !important; }
      .mobile-pad { padding-left:20px !important; padding-right:20px !important; }
      .header-pad { padding:30px 20px !important; }
      .section-pad { padding:18px 14px !important; }
      .cta-td { padding:13px 26px !important; font-size:14px !important; }
      .header-h1 { font-size:22px !important; }
      .items-th { padding:10px 6px !important; font-size:12px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5;">`;

    const wrapOpen = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;"><tr><td align="center" style="padding:28px 10px;"><table class="email-card" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">`;
    const wrapClose = `</table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding:20px 0;">&nbsp;</td></tr></table></td></tr></table></body></html>`;

    const sharedFooter = `
      <tr>
        <td style="background-color:#f2f3f5; padding:26px 40px; border-top:1px solid #e2e2ea;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="text-align:center; padding-bottom:4px;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">The FIL Team</p>
            </td></tr>
            <tr><td style="text-align:center; padding-bottom:14px;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#0fa968;">Think Quality, Think FIL.</p>
            </td></tr>
            <tr><td style="text-align:center;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#666677;">
                Visit us at <a href="https://filstore.com.ng" target="_blank" style="color:#0fa968; text-decoration:none; font-weight:600;">filstore.com.ng</a>
              </p>
            </td></tr>
          </table>
        </td>
      </tr>`;

    // ════════════════════════════════════════════════════════════════════════
    // CUSTOMER EMAIL
    // ════════════════════════════════════════════════════════════════════════
    const customerEmailHtml = `
${emailHead(`Order Confirmed - FIL Store`)}
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Your FIL Store order is confirmed! Order #${order._id} &mdash; we&rsquo;re preparing it now. &#127881;
  </div>
  ${wrapOpen}
    <!-- HEADER -->
    <tr>
      <td class="header-pad" style="background-color:#0fa968; padding:44px 40px; text-align:center;">
        <p style="margin:0 0 10px 0; font-size:48px; line-height:1.2;">&#127881;</p>
        <h1 class="header-h1" style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:28px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">Order Confirmed!</h1>
        <p style="margin:10px 0 16px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:#cdf4e3;">Thank you for choosing FIL Store</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr><td style="background-color:#ffffff; color:#0a7a4a; padding:7px 22px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700;">&#10003; Payment Successful</td></tr>
        </table>
      </td>
    </tr>
    <!-- GREETING -->
    <tr>
      <td class="mobile-pad" style="padding:34px 40px 0 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:18px; font-weight:700; color:#1a1a2e; padding-bottom:12px;">Hi ${orderData.firstName}! &#128075;</td></tr>
          <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#444455; padding-bottom:10px;">Thank you for choosing <strong style="color:#1a1a2e;">Fedan Investment Limited (FIL)</strong> &mdash; we&rsquo;re so glad to have you as part of our family! &#128153;</td></tr>
          <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#444455; padding-bottom:10px;">Your order is confirmed &#9989; and our team is already preparing it with care. You&rsquo;ll receive a shipping update as soon as it&rsquo;s on the way.</td></tr>
          <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#444455; padding-bottom:26px;">At FIL, every product is an opportunity to empower you and make your daily life smoother, easier, and more connected &mdash; because to us, you&rsquo;re not just a customer, you&rsquo;re family.</td></tr>
          <tr>
            <td style="text-align:center; padding-bottom:30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr><td style="border-radius:30px; background-color:#0fa968;">
                  <a href="https://filstore.com.ng/products" target="_blank" class="cta-td" style="display:inline-block; padding:15px 38px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">Explore More Products &#8594;</a>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- ORDER DETAILS -->
    <tr>
      <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4faf7; border-radius:12px; border-left:4px solid #0fa968;">
          <tr>
            <td class="section-pad" style="padding:22px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e; padding-bottom:14px; border-bottom:2px solid #d4ece1;">&#128230; Order Details</td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Order ID</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-align:right;">${order._id}</td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Status</td><td style="text-align:right;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr><td style="background-color:#e8f5e9; color:#1a7a4a; padding:4px 14px; border-radius:12px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; font-weight:700;">&#10003; Confirmed</td></tr></table></td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Name</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.firstName} ${orderData.lastName || ""}</td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Email</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.email}</td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Phone</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.phone}</td></tr></table></td></tr>
                ${orderData.addPhone ? `<tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Alt. Phone</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.addPhone}</td></tr></table></td></tr>` : ""}
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%; vertical-align:top;">Address</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.address}</td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">City</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.city}</td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Region</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${regionName}</td></tr></table></td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Delivery Type</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.deliveryType}</td></tr></table></td></tr>
                ${orderData.orderNote ? `<tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%; vertical-align:top;">Note</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right; font-style:italic;">${orderData.orderNote}</td></tr></table></td></tr>` : ""}
                <tr><td style="padding:11px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Payment</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right; text-transform:capitalize;">${orderData.paymentMethod}</td></tr></table></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- ITEMS -->
    <tr>
      <td class="mobile-pad" style="padding:24px 40px 10px 40px; background-color:#ffffff;">
        <p style="margin:0 0 12px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e;">&#128717; Your Items</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px; overflow:hidden; border:1px solid #e0ece6;">
          ${itemsTableHeader}${itemRowsHtml}
        </table>
      </td>
    </tr>
    <!-- SUMMARY -->
    <tr>
      <td class="mobile-pad" style="padding:18px 40px 30px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #0fa968; border-radius:12px; overflow:hidden;">
          <tr><td style="padding:20px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${summaryRowsHtml}</table></td></tr>
        </table>
      </td>
    </tr>
    ${sharedFooter}
  ${wrapClose}`;

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN EMAIL
    // ════════════════════════════════════════════════════════════════════════
    const adminEmailHtml = `
${emailHead(`New Order - FIL Admin`)}
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    New order from ${orderData.firstName} ${orderData.lastName || ""} &mdash; Order #${order._id} &mdash; &#x20A6;${Number(orderData.total).toLocaleString()}
  </div>
  ${wrapOpen}
    <!-- HEADER -->
    <tr>
      <td class="header-pad" style="background-color:#c0392b; padding:36px 40px; text-align:center;">
        <p style="margin:0 0 8px 0; font-size:42px; line-height:1.2;">&#128276;</p>
        <h1 class="header-h1" style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">New Order Received</h1>
        <p style="margin:8px 0 14px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#f5c6c2;">A customer just placed an order &mdash; action may be required</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr><td style="background-color:#ffffff; color:#c0392b; padding:6px 20px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700;">&#9888;&#65039; Review &amp; Fulfil</td></tr>
        </table>
      </td>
    </tr>
    <!-- QUICK STATS BAR -->
    <tr>
      <td style="background-color:#fdf2f2; padding:18px 40px; border-bottom:1px solid #f5c6c2;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:33%; text-align:center; border-right:1px solid #f5c6c2; padding:0 10px;">
              <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; font-weight:600; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">Order ID</p>
              <p style="margin:0; font-family:'Courier New',Courier,monospace; font-size:12px; font-weight:700; color:#1a1a2e;">#${String(order._id).slice(-8).toUpperCase()}</p>
            </td>
            <td style="width:33%; text-align:center; border-right:1px solid #f5c6c2; padding:0 10px;">
              <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; font-weight:600; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">Total</p>
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:800; color:#c0392b;">&#x20A6;${Number(orderData.total).toLocaleString()}</p>
            </td>
            <td style="width:33%; text-align:center; padding:0 10px;">
              <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; font-weight:600; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">Provider</p>
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-transform:capitalize;">${orderData.paymentMethod}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- CUSTOMER INFO -->
    <tr>
      <td class="mobile-pad" style="padding:24px 40px 10px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9fa; border-radius:12px; border-left:4px solid #c0392b;">
          <tr>
            <td class="section-pad" style="padding:20px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e; padding-bottom:14px; border-bottom:2px solid #e9ecef;">&#128100; Customer Information</td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Full Name</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-align:right;">${orderData.firstName} ${orderData.lastName || ""}</td></tr></table></td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Email</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.email}</td></tr></table></td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Phone</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.phone}</td></tr></table></td></tr>
                ${orderData.addPhone ? `<tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Alt. Phone</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.addPhone}</td></tr></table></td></tr>` : ""}
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%; vertical-align:top;">Address</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.address}</td></tr></table></td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">City</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.city}</td></tr></table></td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Region</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${regionName}</td></tr></table></td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Delivery Type</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.deliveryType}</td></tr></table></td></tr>
                ${orderData.orderNote ? `<tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%; vertical-align:top;">Order Note</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right; font-style:italic;">${orderData.orderNote}</td></tr></table></td></tr>` : ""}
                <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Payment Ref</td><td style="font-family:'Courier New',Courier,monospace; font-size:12px; color:#333333; text-align:right;">${orderData.paymentReference}</td></tr></table></td></tr>
                <tr><td style="padding:10px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Ordered At</td><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; color:#333333; text-align:right;">${orderedAt}</td></tr></table></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- ITEMS -->
    <tr>
      <td class="mobile-pad" style="padding:20px 40px 10px 40px; background-color:#ffffff;">
        <p style="margin:0 0 12px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">&#128230; Items Ordered</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px; overflow:hidden; border:1px solid #e0e0e0;">
          ${itemsTableHeader}${itemRowsHtml}
        </table>
      </td>
    </tr>
    <!-- SUMMARY -->
    <tr>
      <td class="mobile-pad" style="padding:16px 40px 20px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #c0392b; border-radius:12px; overflow:hidden;">
          <tr><td style="padding:18px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${summaryRowsHtml}</table></td></tr>
        </table>
      </td>
    </tr>
    <!-- NEXT STEPS -->
    <tr>
      <td class="mobile-pad" style="padding:0 40px 28px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8e1; border-radius:10px; border:1px solid #ffe082;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 10px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#856404;">&#9200; Next Steps</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#6d5603; line-height:22px; padding-bottom:6px;">1. Verify payment reference in your ${orderData.paymentMethod} dashboard</td></tr>
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#6d5603; line-height:22px; padding-bottom:6px;">2. Prepare and package the items listed above</td></tr>
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#6d5603; line-height:22px; padding-bottom:6px;">3. Arrange delivery to ${orderData.city}, ${regionName}</td></tr>
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#6d5603; line-height:22px;">4. Update order status in the <a href="https://filstore.com.ng/admin" target="_blank" style="color:#0a7a4a; font-weight:700; text-decoration:underline;">Admin Dashboard</a></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${sharedFooter}
  ${wrapClose}`;

    // ── PLAIN TEXT EMAILS ─────────────────────────────────────────────────────
    const itemList = orderData.cartItems
      .map(
        (item) =>
          `  - ${item.name} x${item.quantity}  NGN ${Number(item.price).toLocaleString()}  =  NGN ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`
      )
      .join("\n");

    const customerPlainText = `
Hi ${orderData.firstName},

Thank you for choosing Fedan Investment Limited (FIL)!
Your order is confirmed and our team is already preparing it.

ORDER DETAILS
==========================================
Order ID     : ${order._id}
Status       : Confirmed
Name         : ${orderData.firstName} ${orderData.lastName || ""}
Email        : ${orderData.email}
Phone        : ${orderData.phone}${orderData.addPhone ? `\nAlt. Phone   : ${orderData.addPhone}` : ""}
Address      : ${orderData.address}
City         : ${orderData.city}
Region       : ${regionName}
Delivery     : ${orderData.deliveryType}${orderData.orderNote ? `\nOrder Note   : ${orderData.orderNote}` : ""}
Payment      : ${orderData.paymentMethod}

ITEMS ORDERED
==========================================
${itemList}

ORDER SUMMARY
==========================================
Subtotal     : NGN ${Number(orderData.subTotal).toLocaleString()}
Delivery Fee : NGN ${Number(orderData.deliveryFee).toLocaleString()}${orderData.discount > 0 ? `\nDiscount     : -NGN ${Number(orderData.discount).toLocaleString()}` : ""}${orderData.promoCode ? `\nPromo Code   : ${orderData.promoCode}` : ""}
TOTAL        : NGN ${Number(orderData.total).toLocaleString()}

==========================================
Explore more: https://filstore.com.ng/products

With gratitude,
The FIL Team — Think Quality, Think FIL.
https://filstore.com.ng
    `.trim();

    const adminPlainText = `
NEW ORDER ALERT
==========================================
Order ID     : ${order._id}
Ordered At   : ${orderedAt}
Payment Ref  : ${orderData.paymentReference}
Provider     : ${orderData.paymentMethod}

CUSTOMER
==========================================
Name         : ${orderData.firstName} ${orderData.lastName || ""}
Email        : ${orderData.email}
Phone        : ${orderData.phone}${orderData.addPhone ? `\nAlt. Phone   : ${orderData.addPhone}` : ""}
Address      : ${orderData.address}, ${orderData.city}, ${regionName}
Delivery     : ${orderData.deliveryType}${orderData.orderNote ? `\nOrder Note   : ${orderData.orderNote}` : ""}

ITEMS
==========================================
${itemList}

SUMMARY
==========================================
Subtotal     : NGN ${Number(orderData.subTotal).toLocaleString()}
Delivery Fee : NGN ${Number(orderData.deliveryFee).toLocaleString()}${orderData.discount > 0 ? `\nDiscount     : -NGN ${Number(orderData.discount).toLocaleString()}` : ""}${orderData.promoCode ? `\nPromo Code   : ${orderData.promoCode}` : ""}
TOTAL        : NGN ${Number(orderData.total).toLocaleString()}

NEXT STEPS
==========================================
1. Verify payment in ${orderData.paymentMethod} dashboard
2. Prepare and package items
3. Arrange delivery to ${orderData.city}, ${regionName}
4. Update order status: https://filstore.com.ng/admin

FIL Store Admin — Think Quality, Think FIL.
    `.trim();

    // ── SEND EMAILS ──────────────────────────────────────────────────────────
    try {
      await Promise.all([
        sendEmail(
          orderData.email,
          `Order Confirmed - FIL Store (#${order._id})`,
          customerPlainText,
          customerEmailHtml
        ),
        sendEmail(
          process.env.ADMIN_EMAIL,
          `New Order: ${orderData.firstName} ${orderData.lastName || ""} — NGN ${Number(orderData.total).toLocaleString()} (#${order._id})`,
          adminPlainText,
          adminEmailHtml
        ),
      ]);
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