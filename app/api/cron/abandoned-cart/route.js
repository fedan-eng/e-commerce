// app/api/cron/abandoned-cart/route.js — reminds signed-in shoppers about what's left in their cart.
//
// Runs every 10 minutes. A cart gets up to five reminders, timed from when it last changed
// (STEPS below), alternating between the "Your cart is waiting" and "Quick question" emails.
// cart.reminderStep counts how many have gone out; changing the cart resets it (api/cart/sync),
// and checking out empties the cart, which ends the sequence.
// If a run is late (quiet hours, an outage), only the latest step that's due is sent, so nobody
// gets two reminders back to back. Carts older than MAX_AGE_DAYS are never emailed.
//
// GET with "Authorization: Bearer $CRON_SECRET" (Vercel Cron sends it automatically).
// Add ?dryRun=1 to see who would be emailed without sending anything.
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { isQuietHours } from "@/lib/quietHours";
import { buildAbandonedCartEmail, buildQuickQuestionCartEmail } from "@/lib/emails/abandonedCartEmail";

export const dynamic = "force-dynamic";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const STEPS = [
  { after: 30 * MINUTE, build: buildAbandonedCartEmail },
  { after: 3 * HOUR, build: buildQuickQuestionCartEmail },
  { after: 12 * HOUR, build: buildAbandonedCartEmail },
  { after: 24 * HOUR, build: buildQuickQuestionCartEmail },
  { after: 7 * DAY, build: buildAbandonedCartEmail },
];
const MAX_AGE_DAYS = 8;
const BATCH_SIZE = 40; // per run, to stay well inside Gmail's sending limits

// The step a cart of this age should be on: the last one whose time has passed
const dueStep = (age) => STEPS.findLastIndex((s) => age >= s.after);

// Carts with at least one step due that hasn't gone out yet
const dueQuery = (now) => ({
  email: { $nin: [null, ""] },
  "cart.items.0": { $exists: true },
  "cart.abandonedEmailSent": { $ne: true },
  "cart.updatedAt": { $gte: new Date(now - MAX_AGE_DAYS * DAY) },
  $or: STEPS.map((s, i) => ({
    "cart.updatedAt": { $lte: new Date(now - s.after) },
    "cart.reminderStep": { $not: { $gt: i } }, // also matches carts saved before reminderStep existed
  })),
});

export async function GET(req) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isQuietHours()) return Response.json({ message: "Quiet hours, nothing sent" });

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";

  try {
    await connectDB();
    const now = Date.now();
    const users = await User.find(dueQuery(now))
      .select("firstName email cart")
      .sort({ "cart.updatedAt": 1 })
      .limit(BATCH_SIZE)
      .lean();

    const report = { emailed: [], failed: 0 };

    for (const user of users) {
      const step = dueStep(now - new Date(user.cart.updatedAt).getTime());
      const sentSoFar = user.cart.reminderStep ?? 0;
      const entry = { email: user.email, step: step + 1 };
      if (dryRun) {
        report.emailed.push(entry);
        continue;
      }

      // Claim the step first so overlapping runs can't send it twice. Matching updatedAt
      // skips carts that changed since we read them (their sequence just restarted).
      const claimed = await User.findOneAndUpdate(
        { _id: user._id, "cart.updatedAt": user.cart.updatedAt, "cart.reminderStep": sentSoFar || { $in: [0, null] } },
        { "cart.reminderStep": step + 1, "cart.abandonedEmailSent": step === STEPS.length - 1 }
      );
      if (!claimed) continue;

      try {
        const { subject, html, text } = STEPS[step].build({ firstName: user.firstName, items: user.cart.items });
        await sendEmail(user.email, subject, text, html);
        report.emailed.push(entry);
      } catch (err) {
        // Give the step back so the next run retries it
        await User.updateOne(
          { _id: user._id, "cart.updatedAt": user.cart.updatedAt },
          { "cart.reminderStep": sentSoFar, "cart.abandonedEmailSent": false }
        );
        report.failed++;
        console.error(`Cart reminder to ${user.email} failed:`, err.message);
      }
    }

    console.log(`Cart reminders: ${report.emailed.length} sent, ${report.failed} failed${dryRun ? " (dry run)" : ""}`);
    return Response.json({ dryRun, sent: report.emailed.length, failed: report.failed, emailed: report.emailed });
  } catch (err) {
    console.error("Abandoned cart cron error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
