import { StarRating } from "../ui";

// App Store-style summary: big score on the left, stars + rating count beside it
export default function RatingSummary({ average, total, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex items-end gap-8 sm:gap-14">
        <div className="leading-none">
          <p className="text-[44px] font-bold tracking-tight text-forest sm:text-[56px]">{average.toFixed(1)}</p>
          <p className="mt-1 text-[12px] font-medium text-muted sm:text-[13px]">out of 5</p>
        </div>
        <div className="pb-1">
          <StarRating value={average} size={14} gap="gap-0.5" />
          <p className="mt-1.5 text-[12px] text-muted sm:text-[13px]">
            {total.toLocaleString()} rating{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}
