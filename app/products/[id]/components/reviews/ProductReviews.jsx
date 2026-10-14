"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/category/Pagination";
import { countOf, ratingBreakdown } from "../../productUtils";
import { Container, SectionHeading } from "../ui";
import useProductReviews from "./useProductReviews";
import RatingSummary from "./RatingSummary";
import RatingFilter from "./RatingFilter";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

const PAGE_SIZE = 4;

const SORTS = {
  recent: { label: "Most recent", compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  helpful: { label: "Most helpful", compare: (a, b) => countOf(b.likes) - countOf(a.likes) },
  highest: { label: "Highest rated", compare: (a, b) => (b.rating ?? 5) - (a.rating ?? 5) },
  lowest: { label: "Lowest rated", compare: (a, b) => (a.rating ?? 5) - (b.rating ?? 5) },
};

function SortSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-muted">
      <span className="hidden sm:inline">Sort by</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 cursor-pointer appearance-none rounded-full bg-sage pl-5 pr-11 text-[15px] font-medium text-forest outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-forest" />
      </span>
    </label>
  );
}

export default function ProductReviews({ product, user }) {
  const { reviews, loading, vote, submit } = useProductReviews(product._id);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sort, setSort] = useState("recent");
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

  const visible = useMemo(() => {
    const filtered = selectedRatings.length ? reviews.filter((r) => selectedRatings.includes(ratingOf(r))) : reviews;
    return [...filtered].sort(SORTS[sort].compare);
  }, [reviews, selectedRatings, sort]);

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleRating = (star) => {
    setSelectedRatings((prev) => (prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]));
    setPage(1);
  };

  const changeSort = (value) => {
    setSort(value);
    setPage(1);
  };

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
      className="h-12 rounded-full border-2 border-forest px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-forest hover:text-white"
    >
      Write a review
    </button>
  ) : (
    <Link
      href="/login"
      className="inline-flex h-12 items-center rounded-full border-2 border-forest px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-forest hover:text-white"
    >
      Log in to review
    </Link>
  );

  return (
    <section id="reviews-section" className="scroll-mt-24 py-14 md:py-20">
      <Container>
        <SectionHeading title="Product reviews" />

        <div className="mt-8">
          <RatingSummary average={summary.average} total={summary.total} breakdown={breakdown} action={writeButton} />
        </div>

        {writing && (
          <div className="mt-8">
            <ReviewForm onSubmit={submit} onDone={() => setWriting(false)} />
          </div>
        )}

        <div ref={listRef} className="mt-10 grid scroll-mt-24 grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:pt-6">
            <RatingFilter counts={breakdown} selected={selectedRatings} onToggle={toggleRating} />
          </aside>

          <div>
            <div className="flex items-center justify-between gap-4 pb-4">
              <p className="text-base font-semibold text-forest">
                {loading ? "Loading reviews…" : `Showing ${visible.length.toLocaleString()} review${visible.length === 1 ? "" : "s"}`}
              </p>
              <SortSelect value={sort} onChange={changeSort} />
            </div>

            {!loading && pageItems.length === 0 ? (
              <p className="py-12 text-center text-muted">
                {reviews.length ? "No reviews match this filter." : "No reviews yet. Be the first to share yours."}
              </p>
            ) : (
              pageItems.map((review) => <ReviewCard key={review._id} review={review} onVote={handleVote} />)
            )}

            <Pagination page={page} totalPages={totalPages} onChange={changePage} className="mt-8" />
          </div>
        </div>
      </Container>
    </section>
  );
}
