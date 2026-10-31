// app/api/reviews/route.js — submit a review from an emailed review link (no login needed)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import { ReviewError, submitLinkReview } from "@/lib/reviews";

const MAX_LENGTH = 1000;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rating = Number(body.rating);
  const text = sanitizeText(String(body.text || ""), MAX_LENGTH).trim();

  if (!body.token) return NextResponse.json({ error: "Missing review link" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5 stars" }, { status: 400 });
  }
  if (text.length < 3) return NextResponse.json({ error: "Please write a few words about it" }, { status: 400 });

  try {
    await connectDB();
    const { productId } = await submitLinkReview(body.token, { rating, text });
    return NextResponse.json({ ok: true, productId });
  } catch (err) {
    if (err instanceof ReviewError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("Link review failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
