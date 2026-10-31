"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

const MAX_WORDS = 100;
const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export default function ReviewForm({ onSubmit, onDone }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ text: text.trim(), rating });
      toast.success("Thanks! Your review will appear once it's approved.");
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[24px] bg-sage p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-semibold text-forest">Your rating</span>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              className="p-0.5"
            >
              <Star size={22} strokeWidth={0} className={star <= (hover || rating) ? "fill-star" : "fill-star-empty"} />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => wordCount(e.target.value) <= MAX_WORDS && setText(e.target.value)}
        rows={4}
        required
        placeholder="What do you like about it? How do you use it?"
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-white p-4 text-[15px] text-forest outline-none placeholder:text-muted/70 focus:border-forest"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          {wordCount(text)}/{MAX_WORDS} words
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={onDone} className="rounded-full px-5 py-2.5 text-sm font-medium text-forest">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </div>
      </div>
    </form>
  );
}
