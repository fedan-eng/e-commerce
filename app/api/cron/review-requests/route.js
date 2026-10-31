// app/api/cron/review-requests/route.js — reminds buyers to review what they bought.
//
// The first ask is the "Delivered" status email (its "Leave a Review" button). This job
// sends ONE reminder, REMINDER_AFTER_DAYS after delivery, listing only the items that
// still have no review; if everything's been reviewed, nothing is sent.
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

const REMINDER_AFTER_DAYS = 7;
const MAX_AGE_DAYS = 60;
const BATCH_SIZE = 40; // per run, to stay well inside Gmail's sending limits

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// Paid online orders delivered between REMINDER_AFTER_DAYS and MAX_AGE_DAYS ago, not reminded yet
const dueForReminder = () => ({
  source: { $ne: "manual" },
  email: { $nin: [null, ""] },
  paymentStatus: "paid",
  status: { $regex: /^delivered$/i },
  statusHistory: {
    $elemMatch: {
      status: { $regex: /^delivered$/i },
      date: { $lte: daysAgo(REMINDER_AFTER_DAYS), $gte: daysAgo(MAX_AGE_DAYS) },
    },
  },
  reviewReminderSentAt: null,
});

async function sendReminders(dryRun) {
  const orders = await Order.find(dueForReminder()).sort({ createdAt: 1 }).limit(BATCH_SIZE).lean();
  const report = { emailed: [], nothingToReview: 0, failed: 0 };

  for (const order of orders) {
    const items = await unreviewedItems(order);

    if (items.length === 0) {
      // Everything's reviewed: close the order out so it's never emailed
      report.nothingToReview++;
      if (!dryRun) await Order.updateOne({ _id: order._id }, { reviewReminderSentAt: new Date() });
      continue;
    }

    const entry = { orderId: String(order._id), email: order.email, items: items.map((i) => i.name) };
    if (dryRun) {
      report.emailed.push(entry);
      continue;
    }

    // Claim the order first so overlapping runs can't email it twice
    const claimed = await Order.findOneAndUpdate({ _id: order._id, reviewReminderSentAt: null }, { reviewReminderSentAt: new Date() });
    if (!claimed) continue;

    try {
      const { subject, html, text } = buildReviewRequestEmail({
        firstName: order.firstName,
        isReminder: true,
        items: items.map((i) => ({ name: i.name, image: i.image, color: i.color, link: reviewLink(order._id, productIdOf(i)) })),
      });
      await sendEmail(order.email, subject, text, html);
      report.emailed.push(entry);
    } catch (err) {
      console.error(`Review reminder failed for order ${order._id}:`, err.message);
      await Order.updateOne({ _id: order._id }, { reviewReminderSentAt: null }); // retry next run
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
    return Response.json({ dryRun, ...(await sendReminders(dryRun)) });
  } catch (err) {
    console.error("Review reminder cron failed:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
