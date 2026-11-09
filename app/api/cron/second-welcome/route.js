// app/api/cron/second-welcome/route.js — the "So, you probably do not know..." email, 3 hours after
// an account is created.
//
// Runs every 15 minutes. Only verified accounts (or Google sign-ups) created in the last
// MAX_AGE_HOURS are emailed, so older customers never get it. Waits out quiet hours.
//
// GET with "Authorization: Bearer $CRON_SECRET" (Vercel Cron sends it automatically).
// Add ?dryRun=1 to see who would be emailed without sending anything.
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { isQuietHours } from "@/lib/quietHours";
import { buildSecondWelcomeEmail } from "@/lib/emails/secondWelcomeEmail";

export const dynamic = "force-dynamic";

const HOUR = 60 * 60 * 1000;
const SEND_AFTER_HOURS = 3;
const MAX_AGE_HOURS = 48;
const BATCH_SIZE = 40; // per run, to stay well inside Gmail's sending limits

const dueQuery = (now) => ({
  email: { $nin: [null, ""] },
  createdAt: { $lte: new Date(now - SEND_AFTER_HOURS * HOUR), $gte: new Date(now - MAX_AGE_HOURS * HOUR) },
  secondWelcomeSentAt: null,
  $or: [{ isVerified: true }, { googleId: { $nin: [null, ""] } }],
});

export async function GET(req) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isQuietHours()) return Response.json({ message: "Quiet hours, nothing sent" });

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";

  try {
    await connectDB();
    const users = await User.find(dueQuery(Date.now())).select("firstName email").sort({ createdAt: 1 }).limit(BATCH_SIZE).lean();
    const report = { emailed: [], failed: 0 };

    for (const user of users) {
      if (dryRun) {
        report.emailed.push(user.email);
        continue;
      }

      // Claim the user first so overlapping runs can't email them twice
      const claimed = await User.findOneAndUpdate({ _id: user._id, secondWelcomeSentAt: null }, { secondWelcomeSentAt: new Date() });
      if (!claimed) continue;

      try {
        const { subject, html, text } = buildSecondWelcomeEmail({ firstName: user.firstName });
        await sendEmail(user.email, subject, text, html);
        report.emailed.push(user.email);
      } catch (err) {
        await User.updateOne({ _id: user._id }, { secondWelcomeSentAt: null }); // retry next run
        report.failed++;
        console.error(`Second welcome to ${user.email} failed:`, err.message);
      }
    }

    console.log(`Second welcome: ${report.emailed.length} sent, ${report.failed} failed${dryRun ? " (dry run)" : ""}`);
    return Response.json({ dryRun, sent: report.emailed.length, failed: report.failed, emailed: report.emailed });
  } catch (err) {
    console.error("Second welcome cron error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
