"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Star } from "lucide-react";

const LABELS = ["", "Poor", "Not great", "Okay", "Good", "Love it"];
const MAX_LENGTH = 1000;

export default function ReviewLinkForm({ token, productId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Tap a star to rate it");
    if (text.trim().length < 3) return setError("Please write a few words about it");

    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setState("done");
    } catch (err) {
      setError(err.message);
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="mt-8 flex flex-col items-center rounded-2xl bg-mint/50 p-6 text-center">
        <CircleCheck size={32} className="text-forest" />
        <p className="mt-3 text-lg font-bold text-forest">Thank you!</p>
        <p className="mt-1 text-sm text-muted">Your review will appear on the product page once we&apos;ve checked it.</p>
        <Link href={`/products/${productId}`} className="mt-4 font-semibold text-forest underline underline-offset-2">
          Back to the product
        </Link>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form onSubmit={submit} className="mt-8">
      <fieldset>
        <legend className="text-[15px] font-semibold text-forest">Your rating</legend>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-pressed={rating === star}
                onClick={() => {
                  setRating(star);
                  setError("");
                }}
                onMouseEnter={() => setHover(star)}
                className="p-1"
              >
                <Star size={34} strokeWidth={0} className={star <= shown ? "fill-star" : "fill-star-empty"} />
              </button>
            ))}
          </div>
          {shown > 0 && <span className="text-sm font-medium text-muted">{LABELS[shown]}</span>}
        </div>
      </fieldset>

      <label htmlFor="review-text" className="mt-6 block text-[15px] font-semibold text-forest">
        Tell other shoppers about it
      </label>
      <textarea
        id="review-text"
        value={text}
        onChange={(e) => {
          setText(e.target.value.slice(0, MAX_LENGTH));
          setError("");
        }}
        rows={5}
        placeholder="What do you like about it? How long does the battery last?"
        className="mt-2 w-full resize-none rounded-2xl border border-transparent bg-sage p-4 text-[15px] text-forest outline-none placeholder:text-muted/60 focus:border-forest focus:bg-white"
      />
      <p className="mt-1 text-right text-xs text-muted">
        {text.length}/{MAX_LENGTH}
      </p>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-4 h-[52px] w-full rounded-full bg-forest text-base font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Post my review"}
      </button>
      <p className="mt-3 text-center text-xs text-muted">Shown with your first name and marked as a verified purchase.</p>
    </form>
  );
}
