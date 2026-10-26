"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import Pagination from "@/components/category/Pagination";
import { formatReviewDate, ratingBreakdown } from "../../productUtils";
import { Container, SectionHeading } from "../ui";
import useProductReviews from "./useProductReviews";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

const PAGE_SIZE = 6;

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

// Consecutive reviews from the same day share one date chip, like a chat
function groupByDay(reviews) {
  const groups = [];
  reviews.forEach((r) => {
    const day = formatReviewDate(r.createdAt);
    if (groups.at(-1)?.day === day) groups.at(-1).items.push(r);
    else groups.push({ day, items: [r] });
  });
  return groups;
}

// WhatsApp's beige chat wallpaper with a faint dot pattern
const CHAT_WALLPAPER = {
  backgroundColor: "#efeae2",
  backgroundImage: "radial-gradient(rgba(84,101,111,0.08) 1px, transparent 1px)",
  backgroundSize: "14px 14px",
};

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

        <div
          ref={listRef}
          className="mt-8 scroll-mt-24 overflow-hidden rounded-[20px] border border-line md:mt-12 md:rounded-[24px]"
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 bg-[#008069] px-4 py-2.5 text-white sm:py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white sm:h-10 sm:w-10">
              <Image src="/fillogo.png" alt="" width={28} height={12} className="h-auto w-[26px]" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[15px] font-semibold sm:text-base">{product.name} reviews</p>
              <p className="mt-0.5 text-[12px] text-white/80">
                {loading ? "loading…" : `${visible.length.toLocaleString()} customer${visible.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>

          <div className="px-3 pb-6 pt-3 sm:px-6 sm:pb-8" style={CHAT_WALLPAPER}>
            {!loading && pageItems.length === 0 ? (
              <p className="mx-auto my-10 w-fit max-w-[90%] rounded-lg bg-[#fff3c4] px-3 py-2 text-center text-[12.5px] text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                No reviews yet. Be the first to share yours.
              </p>
            ) : (
              groupByDay(pageItems).map(({ day, items }) => (
                <div key={day + items[0]._id} className="pt-2">
                  <p className="mx-auto mb-1 mt-2 w-fit rounded-lg bg-white/95 px-3 py-1 text-[11.5px] font-medium uppercase tracking-wide text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                    {day}
                  </p>
                  {items.map((review) => (
                    <ReviewCard key={review._id} review={review} onVote={handleVote} />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={changePage} className="mt-6 md:mt-8" />
      </Container>
    </section>
  );
}
