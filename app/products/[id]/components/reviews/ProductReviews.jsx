"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Container } from "../ui";
import useProductReviews from "./useProductReviews";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

function ArrowButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-forest text-forest transition-colors hover:bg-forest hover:text-white disabled:pointer-events-none disabled:border-line disabled:text-faint"
    >
      {children}
    </button>
  );
}

export default function ProductReviews({ product, user }) {
  const { reviews, loading, vote, submit } = useProductReviews(product._id);
  const [writing, setWriting] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });
  const railRef = useRef(null);

  const ratingOf = (r) => r.rating ?? 5;
  // The summary comes from the same approved-review list as the cards,
  // so the two can never disagree.
  const summary = useMemo(() => {
    if (loading) return { average: product.averageRating || 0, total: product.ratingsCount || 0 };
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, r) => sum + ratingOf(r), 0) / total : 0;
    return { average, total };
  }, [loading, reviews, product.averageRating, product.ratingsCount]);

  const visible = useMemo(() => [...reviews].sort(newestFirst), [reviews]);

  // Greys out an arrow when the row can't scroll any further that way
  const updateEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [visible, updateEdges]);

  // One card's width per click
  const scroll = (dir) => {
    const el = railRef.current;
    const card = el?.firstElementChild;
    if (!card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  const handleVote = (id, type) => {
    if (!user) return toast("Log in to rate reviews");
    vote(id, type);
  };

  const writeButton = user ? (
    <button
      type="button"
      onClick={() => setWriting(true)}
      className="h-10 rounded-full border-2 border-forest px-5 text-[13px] font-semibold text-forest transition-colors hover:bg-forest hover:text-white sm:h-11 sm:text-[14px]"
    >
      Write a review
    </button>
  ) : (
    <Link
      href="/login"
      className="inline-flex h-10 items-center rounded-full border-2 border-forest px-5 text-[13px] font-semibold text-forest transition-colors hover:bg-forest hover:text-white sm:h-11 sm:text-[14px]"
    >
      Log in to review
    </Link>
  );

  return (
    <section id="reviews-section" className="scroll-mt-24 py-10">
      <Container>
        <div className="border-t border-dashed border-line pt-6 sm:pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-1 text-[20px] font-bold tracking-tight text-forest sm:text-[26px]">
              Ratings &amp; reviews
              <ChevronRight size={20} className="text-muted" aria-hidden />
            </h2>
            {visible.length > 1 && (
              <div className="flex items-center gap-2">
                <ArrowButton label="Previous reviews" disabled={edges.start} onClick={() => scroll(-1)}>
                  <ArrowLeft size={16} />
                </ArrowButton>
                <ArrowButton label="Next reviews" disabled={edges.end} onClick={() => scroll(1)}>
                  <ArrowRight size={16} />
                </ArrowButton>
              </div>
            )}
          </div>

          <div className="mt-3 sm:mt-4">
            <RatingSummary average={summary.average} total={summary.total} action={writeButton} />
          </div>
        </div>

        {writing && (
          <div className="mt-8">
            <ReviewForm onSubmit={submit} onDone={() => setWriting(false)} />
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-muted">Loading reviews…</p>
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-muted">No reviews yet. Be the first to share yours.</p>
        ) : (
          <div
            ref={railRef}
            onScroll={updateEdges}
            className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:mt-8 sm:scroll-px-0 sm:px-0"
          >
            {visible.map((review) => (
              <ReviewCard key={review._id} review={review} onVote={handleVote} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
