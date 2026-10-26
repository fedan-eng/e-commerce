import { BadgeCheck } from "lucide-react";
import { countOf, formatReviewDate } from "../../productUtils";
import { StarRating } from "../ui";

// WhatsApp group-chat sender colours (dark-mode shades); each reviewer keeps the same one
const NAME_COLORS = ["#53bdeb", "#ffd279", "#a5f3c4", "#ff9fb6", "#c7b4ff", "#7fe0e0", "#ffb38a"];

function nameColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

// A "reaction" pill hanging off the bubble, used for the helpful votes
function Reaction({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-7 items-center gap-1 rounded-full border px-2 text-[12px] font-medium text-[#54656f] shadow-[0_1px_1px_rgba(11,20,26,0.12)] transition-colors ${
        active ? "border-[#25d366] bg-[#e7fce3]" : "border-white bg-white hover:bg-[#f5f6f6]"
      }`}
    >
      {children}
    </button>
  );
}

// One review drawn as a dark-green WhatsApp message bubble, tail and all
export default function ReviewCard({ review, onVote }) {
  const name = review.user?.firstName || review.authorName || "FIL customer";
  const likes = countOf(review.likes);
  const color = review.color && `${review.color[0].toUpperCase()}${review.color.slice(1)}`;

  return (
    <article className="flex flex-col items-start pl-2">
      <div
        className="relative w-fit max-w-full rounded-[12px] rounded-tl-none bg-[#005c4b] px-3 pb-2 pt-2 shadow-[0_1px_1px_rgba(11,20,26,0.25)] sm:max-w-[680px] sm:px-4 sm:pt-2.5"
      >
        <span aria-hidden className="absolute -left-2 top-0 h-3 w-2 bg-[#005c4b] [clip-path:polygon(100%_0,0_0,100%_100%)]" />

        <p className="flex items-center gap-1 text-[13px] font-semibold leading-5" style={{ color: nameColor(name) }}>
          {name}
          {review.verified && <BadgeCheck size={13} className="text-[#25d366]" aria-label="Verified buyer" />}
          {(review.verified || color) && (
            <span className="ml-1 truncate text-[11.5px] font-normal text-white/60">
              {[review.verified && "Verified buyer", color].filter(Boolean).join(" · ")}
            </span>
          )}
        </p>

        <StarRating value={review.rating ?? 5} size={12} gap="gap-0.5" className="mt-0.5" />
        {review.title && <h4 className="mt-1 text-[14px] font-semibold leading-snug text-white sm:text-[15px]">{review.title}</h4>}
        <p className="mt-0.5 whitespace-pre-line break-words text-[14px] leading-[1.45] text-[#e9edef] sm:text-[15px]">
          {review.text}
          {/* Keeps room for the timestamp on the last line, like WhatsApp does */}
          <span aria-hidden className="inline-block w-24" />
        </p>
        <time dateTime={review.createdAt} className="absolute bottom-1.5 right-3 text-[11px] leading-none text-white/60">
          {formatReviewDate(review.createdAt)}
        </time>
      </div>

      <div className="relative -mt-1 ml-2 flex gap-1">
        <Reaction label="Helpful" active={review.isLiked} onClick={() => onVote(review._id, "like")}>
          <span aria-hidden>👍</span>
          {likes > 0 && likes.toLocaleString()}
        </Reaction>
        <Reaction label="Not helpful" active={review.isDisliked} onClick={() => onVote(review._id, "dislike")}>
          <span aria-hidden>👎</span>
        </Reaction>
      </div>
    </article>
  );
}
