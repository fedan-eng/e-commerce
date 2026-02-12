// app/api/feedback/route.js
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { rating:rawRating, comment } = await req.json();
    const rating = Number(rawRating);

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const message = `
🛍️ Anonymous Customer Feedback

⭐ Rating: ${rating} star${rating > 1 ? "s" : ""}
🗒️ Comment:
${comment || "(No comment provided)"}
    `;

    await sendEmail(process.env.ADMIN_EMAIL, "New Anonymous Feedback", message);

    return NextResponse.json({ message: "Feedback sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}
