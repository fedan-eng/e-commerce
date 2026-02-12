import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mailer";

export const config = {
  schedule: "* 10 * * *", // runs every day at 10 AM UTC
};

export async function GET() {
  await connectDB();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    //const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const orders = await Order.find({
      createdAt: { $lte: sevenDaysAgo },
      followUpSent: false,
    });

    // const orders = await Order.find({
    //   createdAt: { $lte: fiveMinutesAgo },
    //   followUpSent: false,
    // });

    for (const order of orders) {
      const emailText = `
Hi ${order.firstName},

We hope your new ${order.items
        .map((i) => i.name)
        .join(", ")} is already making life a little easier for you. 🎉

At FIL, we see every product as more than just an accessory — it’s a way to keep you connected, productive, and empowered to do more with your day. Your trust means the world to us, and we’re honored you chose to make us part of your journey. 💙

We’d love to hear how your experience has been so far. Your voice not only helps us improve — it helps us care better for every member of our FIL family.

You can rate your product directly by visiting it on our website. Your feedback helps us serve you better!

And remember, our support doesn’t end after delivery. We’re here whenever you need us. Whether it’s for guidance, quick tips, or just to listen — we’re only a call away.

Thank you once again for choosing FIL. We look forward to growing with you.

With gratitude,  
The FIL Team  
Think Quality, Think FIL.
`.trim();

      await sendEmail(order.email, "How’s your FIL Store order?", emailText);

      order.followUpSent = true;
      await order.save();
    }

    return new Response(
      JSON.stringify({ message: `Sent ${orders.length} follow-up emails.` }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Follow-up email error:", err);
    return new Response(
      JSON.stringify({
        message: "Error sending follow-up emails",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}
// This code is a server-side function that connects to a MongoDB database, retrieves orders older than 7 days that haven't had follow-up emails sent, and sends those emails. It also updates the order status to indicate that the follow-up email has been sent.
