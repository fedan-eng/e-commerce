// app/api/cron/abandoned-cart/route.js

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { buildAbandonedCartEmail } from "@/lib/emails/abandonedCartEmail";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDB();

  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const abandonedUsers = await User.find({
      "cart.items.0": { $exists: true },
      "cart.updatedAt": { $lte: fiveDaysAgo },
      "cart.abandonedEmailSent": false,
    }).select("firstName email cart");

    console.log(`Found ${abandonedUsers.length} abandoned carts`);

    const results = await Promise.allSettled(
      abandonedUsers.map(async (user) => {
        const { subject, html, text } = buildAbandonedCartEmail({ firstName: user.firstName, items: user.cart?.items });
        await sendEmail(user.email, subject, text, html);

        await User.findByIdAndUpdate(user._id, {
          "cart.abandonedEmailSent": true,
        });

        console.log(`Abandoned cart email sent to ${user.email}`);
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ message: "Done", sent, failed }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Abandoned cart cron error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500 }
    );
  }
}
