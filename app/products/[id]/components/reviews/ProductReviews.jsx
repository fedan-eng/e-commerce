"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Pagination from "@/components/category/Pagination";
import { ratingBreakdown } from "../../productUtils";
import { Container, SectionHeading } from "../ui";
import useProductReviews from "./useProductReviews";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

const PAGE_SIZE = 6;

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export default function ProductReviews({ product, user }) {
  const { reviews, loading, vote, submit } = useProductReviews(product._id);
  const [page, setPage] = useState(1);
  const [writing, setWriting] = useState(false);
  const listRef = useRef(null);

  const ratingOf = (r) => r.rating ?? 5;
  // Summary, bars and filter counts all come from the same approved-review list,
  // so they can never disagree with what's shown below them.
  const breakdown = useMemo(() => ratingBreakdown(reviews, ratingOf), [reviews]);
  const summary = useMemo(() => {
    if (loading) return { average: product.averageRating || 0, total: product.ratingsCount || 0 };
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, r) => sum + ratingOf(r), 0) / total : 0;
    return { average, total };
  }, [loading, reviews, product.averageRating, product.ratingsCount]);

  const visible = useMemo(() => [...reviews].sort(newestFirst), [reviews]);

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changePage = (n) => {
    setPage(n);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleVote = (id, type) => {
    if (!user) return toast("Log in to rate reviews");
    vote(id, type);
  };

  const writeButton = user ? (
    <button
      type="button"
      onClick={() => setWriting(true)}
      className="h-11 rounded-full border-2 border-forest px-5 text-[14px] font-semibold sm:h-12 sm:px-6 sm:text-[15px] text-forest transition-colors hover:bg-forest hover:text-white"
    >
      Write a review
    </button>
  ) : (
    <Link
      href="/login"
      className="inline-flex h-11 items-center rounded-full border-2 border-forest px-5 text-[14px] font-semibold sm:h-12 sm:px-6 sm:text-[15px] text-forest transition-colors hover:bg-forest hover:text-white"
    >
      Log in to review
    </Link>
  );

  return (
    <section id="reviews-section" className="scroll-mt-24 py-10 md:py-20">
      <Container>
        <SectionHeading title="Product reviews" />

        <div className="mt-6 md:mt-8">
          <RatingSummary average={summary.average} total={summary.total} breakdown={breakdown} action={writeButton} />
        </div>

        {writing && (
          <div className="mt-8">
            <ReviewForm onSubmit={submit} onDone={() => setWriting(false)} />
          </div>
        )}

        <div ref={listRef} className="mt-8 scroll-mt-24 md:mt-12">
          <p className="pb-2 text-[15px] font-semibold text-forest sm:text-base">
            {loading ? "Loading reviews…" : `Showing ${visible.length.toLocaleString()} review${visible.length === 1 ? "" : "s"}`}
          </p>

          {!loading && pageItems.length === 0 ? (
            <p className="py-12 text-center text-muted">No reviews yet. Be the first to share yours.</p>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5">
              {pageItems.map((review) => (
                <ReviewCard key={review._id} review={review} onVote={handleVote} />
              ))}
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={changePage} className="mt-6 md:mt-8" />
      </Container>
    </section>
  );
}
