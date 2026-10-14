// app/api/cron/review-requests/route.js — asks buyers to review what they bought.
//
// Per delivered order, at most two emails, each listing only the items not reviewed yet:
//   1. the request, REQUEST_AFTER_DAYS after delivery
//   2. one reminder, REMINDER_AFTER_DAYS after the request
// Orders delivered more than MAX_AGE_DAYS ago are never emailed.
//
// GET with "Authorization: Bearer $CRON_SECRET" (Vercel Cron sends it automatically).
// Add ?dryRun=1 to see who would be emailed without sending anything.
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mailer";
import { productIdOf, reviewLink, unreviewedItems } from "@/lib/reviews";
import { buildReviewRequestEmail } from "@/lib/emails/reviewRequestEmail";

export const dynamic = "force-dynamic";

const REQUEST_AFTER_DAYS = 2;
const REMINDER_AFTER_DAYS = 7;
const MAX_AGE_DAYS = 60;
const BATCH_SIZE = 40; // per phase per run, to stay well inside Gmail's sending limits

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// Online orders that were delivered (and paid) between MAX_AGE_DAYS and `deliveredBefore` ago
const deliveredOrders = (deliveredBefore) => ({
  source: { $ne: "manual" },
  email: { $nin: [null, ""] },
  paymentStatus: "paid",
  status: { $regex: /^delivered$/i },
  statusHistory: {
    $elemMatch: { status: { $regex: /^delivered$/i }, date: { $lte: deliveredBefore, $gte: daysAgo(MAX_AGE_DAYS) } },
  },
});

const PHASES = [
  {
    name: "request",
    field: "reviewRequestSentAt",
    isReminder: false,
    query: () => ({ ...deliveredOrders(daysAgo(REQUEST_AFTER_DAYS)), reviewRequestSentAt: null }),
  },
  {
    name: "reminder",
    field: "reviewReminderSentAt",
    isReminder: true,
    query: () => ({
      ...deliveredOrders(new Date()),
      reviewRequestSentAt: { $ne: null, $lte: daysAgo(REMINDER_AFTER_DAYS) },
      reviewReminderSentAt: null,
    }),
  },
];

async function runPhase(phase, dryRun) {
  const orders = await Order.find(phase.query()).sort({ createdAt: 1 }).limit(BATCH_SIZE).lean();
  const report = { phase: phase.name, emailed: [], nothingToReview: 0, failed: 0 };

  for (const order of orders) {
    const items = await unreviewedItems(order);

    if (items.length === 0) {
      // Everything's reviewed: close the order out so it's never emailed
      report.nothingToReview++;
      if (!dryRun) await Order.updateOne({ _id: order._id }, { reviewRequestSentAt: order.reviewRequestSentAt || new Date(), reviewReminderSentAt: new Date() });
      continue;
    }

    const entry = { orderId: String(order._id), email: order.email, items: items.map((i) => i.name) };
    if (dryRun) {
      report.emailed.push(entry);
      continue;
    }

    // Claim the order first so overlapping runs can't email it twice
    const claimed = await Order.findOneAndUpdate({ _id: order._id, [phase.field]: null }, { [phase.field]: new Date() });
    if (!claimed) continue;

    try {
      const { subject, html, text } = buildReviewRequestEmail({
        firstName: order.firstName,
        isReminder: phase.isReminder,
        items: items.map((i) => ({ name: i.name, image: i.image, color: i.color, link: reviewLink(order._id, productIdOf(i)) })),
      });
      await sendEmail(order.email, subject, text, html);
      report.emailed.push(entry);
    } catch (err) {
      console.error(`Review ${phase.name} email failed for order ${order._id}:`, err.message);
      await Order.updateOne({ _id: order._id }, { [phase.field]: null }); // retry next run
      report.failed++;
    }
  }

  return report;
}

export async function GET(req) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";

  try {
    await connectDB();
    const results = [];
    for (const phase of PHASES) results.push(await runPhase(phase, dryRun));
    return Response.json({ dryRun, results });
  } catch (err) {
    console.error("Review request cron failed:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
