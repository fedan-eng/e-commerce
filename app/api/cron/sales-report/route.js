// app/api/cron/sales-report/route.js — emails the sales team a daily call list at 6pm Lagos time.
//
//  - Abandoned payments: Paystack checkouts from the last 24 hours that were abandoned or failed.
//    The name, phone and cart come from the metadata /api/paystack attaches to each one.
//  - Abandoned carts: signed-in shoppers whose cart last changed in the 24 hours up to an hour ago
//    (anyone newer may still be shopping; they're on tomorrow's list).
// Anyone who paid for an order in the same window is left out, and each shopper appears once.
//
// Sent to SALES_EMAIL (comma-separate several), or ADMIN_EMAIL if that isn't set.
// GET with "Authorization: Bearer $CRON_SECRET" (Vercel Cron sends it automatically).
// Add ?dryRun=1 to get the list back as JSON without emailing it.
import axios from "axios";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mailer";
import { toCSV } from "@/lib/csv";
import { buildSalesReportEmail } from "@/lib/emails/salesReportEmail";

export const dynamic = "force-dynamic";

const HOUR = 60 * 60 * 1000;
const STILL_SHOPPING_HOURS = 1;
const MAX_PAYSTACK_PAGES = 10; // 100 transactions a page

const fullName = (...parts) => parts.filter(Boolean).join(" ").trim();
const lower = (email) => String(email || "").trim().toLowerCase();

// Paystack returns metadata as an object, or as a JSON string on some transactions
function metadataOf(tx) {
  if (typeof tx.metadata !== "string") return tx.metadata || {};
  try { return JSON.parse(tx.metadata); } catch { return {}; }
}

async function paystackTransactions(status, from, to) {
  const all = [];
  for (let page = 1; page <= MAX_PAYSTACK_PAGES; page++) {
    const { data } = await axios.get("https://api.paystack.co/transaction", {
      params: { status, from: from.toISOString(), to: to.toISOString(), perPage: 100, page },
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    all.push(...(data.data || []));
    if (page >= (data.meta?.pageCount || 1)) break;
  }
  return all;
}

async function abandonedPayments(from, to) {
  const txs = (await Promise.all([paystackTransactions("abandoned", from, to), paystackTransactions("failed", from, to)])).flat();
  return txs.map((tx) => {
    const meta = metadataOf(tx);
    const info = meta.deliveryInfo || {};
    return {
      name: fullName(info.firstName, info.lastName) || fullName(tx.customer?.first_name, tx.customer?.last_name),
      phone: info.phone || tx.customer?.phone || "",
      email: lower(info.email || tx.customer?.email),
      items: Array.isArray(meta.cartItems) ? meta.cartItems : [],
      value: Number(meta.total ?? tx.amount / 100) || 0,
      at: new Date(tx.created_at || tx.createdAt),
      note: tx.status === "failed" ? `Payment failed${tx.gateway_response ? `: ${tx.gateway_response}` : ""}` : "Left the payment page",
    };
  });
}

async function abandonedCarts(from, to) {
  const users = await User.find({
    email: { $nin: [null, ""] },
    "cart.items.0": { $exists: true },
    "cart.updatedAt": { $gte: from, $lte: to },
  }).select("firstName lastName email phone cart").lean();

  return users.map((u) => ({
    name: fullName(u.firstName, u.lastName),
    phone: u.phone || "",
    email: lower(u.email),
    items: u.cart.items,
    value: u.cart.items.reduce((n, i) => n + Number(i.price || 0) * Number(i.quantity || 1), 0),
    at: new Date(u.cart.updatedAt),
    note: "Items left in cart",
  }));
}

// Latest lead per email, skipping anyone in `exclude`
function dedupe(leads, exclude) {
  const byEmail = new Map();
  for (const lead of leads.sort((a, b) => b.at - a.at)) {
    if (!lead.email || exclude.has(lead.email) || byEmail.has(lead.email)) continue;
    byEmail.set(lead.email, lead);
  }
  return [...byEmail.values()].sort((a, b) => b.value - a.value);
}

const csvColumns = [
  { header: "Type", value: (l) => l.type },
  { header: "Name", value: (l) => l.name },
  { header: "Phone", value: (l) => l.phone },
  { header: "Email", value: (l) => l.email },
  { header: "Value (NGN)", value: (l) => l.value },
  { header: "Items", value: (l) => l.items.map((i) => `${i.name || "Product"} x${i.quantity || 1}`).join("; ") },
  { header: "Note", value: (l) => l.note },
  { header: "When", value: (l) => l.at.toLocaleString("en-NG", { timeZone: "Africa/Lagos" }) },
];

export async function GET(req) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const to = new Date();
  const from = new Date(to - 24 * HOUR);

  try {
    await connectDB();
    const [payments, carts, paidEmails] = await Promise.all([
      abandonedPayments(from, to),
      abandonedCarts(new Date(from - STILL_SHOPPING_HOURS * HOUR), new Date(to - STILL_SHOPPING_HOURS * HOUR)),
      Order.distinct("email", { paymentStatus: "paid", createdAt: { $gte: from } }),
    ]);

    const bought = new Set(paidEmails.map(lower));
    const paymentLeads = dedupe(payments, bought);
    const cartLeads = dedupe(carts, new Set([...bought, ...paymentLeads.map((l) => l.email)]));

    if (dryRun) return Response.json({ dryRun, from, to, payments: paymentLeads, carts: cartLeads });

    const recipients = process.env.SALES_EMAIL || process.env.ADMIN_EMAIL;
    if (!recipients) throw new Error("SALES_EMAIL / ADMIN_EMAIL is not set");

    const { subject, html, text } = buildSalesReportEmail({ carts: cartLeads, payments: paymentLeads, from, to });
    const csv = toCSV(
      [...paymentLeads.map((l) => ({ ...l, type: "Abandoned payment" })), ...cartLeads.map((l) => ({ ...l, type: "Abandoned cart" }))],
      csvColumns
    );
    const day = to.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
    // BOM so Excel reads the file as UTF-8
    await sendEmail(recipients, subject, text, html, [{ filename: `call-list-${day}.csv`, content: "﻿" + csv, contentType: "text/csv; charset=utf-8" }]);

    console.log(`Sales report sent: ${paymentLeads.length} payments, ${cartLeads.length} carts`);
    return Response.json({ sent: true, payments: paymentLeads.length, carts: cartLeads.length });
  } catch (err) {
    console.error("Sales report cron error:", err.response?.data || err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
