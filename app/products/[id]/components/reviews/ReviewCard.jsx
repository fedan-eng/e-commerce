import { BadgeCheck } from "lucide-react";
import { countOf } from "../../productUtils";
import { StarRating } from "../ui";

// WhatsApp group-chat sender colours; each reviewer keeps the same one
const NAME_COLORS = ["#1f7aec", "#c4532d", "#0b9a52", "#a33fd6", "#d3366b", "#027eb5", "#b5650f"];

function nameColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

const formatTime = (date) => new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

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

// One review drawn as an incoming WhatsApp message, tail and all
export default function ReviewCard({ review, onVote }) {
  const name = review.user?.firstName || review.authorName || "FIL customer";
  const likes = countOf(review.likes);
  const color = review.color && `${review.color[0].toUpperCase()}${review.color.slice(1)}`;

  return (
    <article className="mt-3 flex flex-col items-start">
      <div
        className="relative max-w-[88%] rounded-[10px] rounded-tl-none bg-white px-2.5 pb-1.5 pt-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] sm:max-w-[75%] sm:px-3"
      >
        <span aria-hidden className="absolute -left-2 top-0 h-3 w-2 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)]" />

        <p className="flex items-center gap-1 text-[13px] font-semibold leading-5" style={{ color: nameColor(name) }}>
          {name}
          {review.verified && <BadgeCheck size={13} className="text-[#25d366]" aria-label="Verified buyer" />}
          {(review.verified || color) && (
            <span className="ml-1 truncate text-[11.5px] font-normal text-[#667781]">
              {[review.verified && "Verified buyer", color].filter(Boolean).join(" · ")}
            </span>
          )}
        </p>

        <StarRating value={review.rating ?? 5} size={12} gap="gap-0.5" className="mt-0.5" />
        {review.title && <h4 className="mt-1 text-[14px] font-semibold leading-snug text-[#111b21]">{review.title}</h4>}
        <p className="mt-0.5 whitespace-pre-line break-words text-[14px] leading-[1.4] text-[#111b21] sm:text-[14.5px]">
          {review.text}
          {/* Keeps room for the timestamp on the last line, like WhatsApp does */}
          <span aria-hidden className="inline-block w-12" />
        </p>
        <time dateTime={review.createdAt} className="absolute bottom-1 right-2.5 text-[11px] leading-none text-[#667781]">
          {formatTime(review.createdAt)}
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
