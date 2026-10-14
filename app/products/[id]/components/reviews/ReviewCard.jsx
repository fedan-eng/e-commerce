import { ThumbsDown, ThumbsUp, User } from "lucide-react";
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
        active ? "border-forest bg-forest text-white" : "border-line text-forest hover:border-forest"
      }`}
    >
      {children}
    </button>
  );
}

export default function ReviewCard({ review, onVote }) {
  const name = review.user?.firstName;
  const likes = countOf(review.likes);

  return (
    <article className="border-b border-line py-7 first:pt-2">
      <div className="flex items-start justify-between gap-4">
        <StarRating value={review.rating ?? 5} size={15} />
        <time dateTime={review.createdAt} className="shrink-0 text-sm text-muted">
          {formatReviewDate(review.createdAt)}
        </time>
      </div>

      {review.title && <h4 className="mt-3 text-lg font-semibold text-forest">{review.title}</h4>}
      <p className="mt-2 max-w-[640px] whitespace-pre-line text-base italic leading-relaxed text-muted">{review.text}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-forest">
            <User size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-forest">{name || "Verified buyer"}</p>
            <p className="mt-0.5 text-[13px] text-muted">{review.color ? `Colour: ${review.color}` : name ? "Verified buyer" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 text-sm text-muted">Helpful?</span>
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
