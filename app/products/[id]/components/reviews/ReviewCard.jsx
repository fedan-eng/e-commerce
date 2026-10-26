import { BadgeCheck, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { countOf, formatReviewDate } from "../../productUtils";
import { StarRating } from "../ui";

function VoteButton({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors ${
        active ? "border-white bg-white text-forest" : "border-white/30 text-white hover:border-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function ReviewCard({ review, onVote }) {
  const name = review.user?.firstName || review.authorName || "FIL customer";
  const likes = countOf(review.likes);
  // "Verified buyer" only when the review is tied to a delivered order
  const details = [review.verified && "Verified buyer", review.color && `Colour: ${review.color[0].toUpperCase()}${review.color.slice(1)}`].filter(Boolean).join(" · ");

  return (
    <article className="rounded-[20px] bg-forest p-5 sm:rounded-[24px] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <StarRating value={review.rating ?? 5} size={15} />
        <time dateTime={review.createdAt} className="shrink-0 text-[13px] text-white/60 sm:text-sm">
          {formatReviewDate(review.createdAt)}
        </time>
      </div>

      {review.title && <h4 className="mt-3 text-base font-semibold text-white sm:text-lg">{review.title}</h4>}
      <p className="mt-2 max-w-[640px] whitespace-pre-line text-[14px] italic leading-relaxed text-white/80 sm:text-base">{review.text}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-forest">
            <User size={16} />
          </span>
          <div className="leading-tight">
            <p className="flex items-center gap-1 text-[14px] font-semibold text-white sm:text-[15px]">
              {name}
              {review.verified && <BadgeCheck size={15} className="text-[#25d366]" aria-hidden />}
            </p>
            {details && <p className="mt-0.5 text-[12px] text-white/60 sm:text-[13px]">{details}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 text-[13px] text-white/60 sm:text-sm">Helpful?</span>
          <VoteButton label="Helpful" active={review.isLiked} onClick={() => onVote(review._id, "like")}>
            <ThumbsUp size={15} />
            {likes > 0 && likes.toLocaleString()}
          </VoteButton>
          <VoteButton label="Not helpful" active={review.isDisliked} onClick={() => onVote(review._id, "dislike")}>
            <ThumbsDown size={15} />
          </VoteButton>
        </div>
      </div>
    </article>
  );
}
