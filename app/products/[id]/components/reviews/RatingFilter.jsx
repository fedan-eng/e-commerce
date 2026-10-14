import { Check, Star } from "lucide-react";
import { StarRating } from "../ui";

const STARS = [5, 4, 3, 2, 1];

// Checkbox list on desktop, scrollable chips on mobile
export default function RatingFilter({ counts, selected, onToggle }) {
  return (
    <>
      <div className="hidden lg:block">
        <h3 className="text-[15px] font-semibold text-forest">Filter by rating</h3>
        <ul className="mt-4 flex flex-col gap-3.5">
          {STARS.map((star) => {
            const checked = selected.includes(star);
            return (
              <li key={star}>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => onToggle(star)} />
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-forest/40 ${
                      checked ? "border-forest bg-forest text-white" : "border-[#8fa69b]"
                    }`}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                  <StarRating value={star} size={12} />
                  <span className="ml-auto text-[13px] text-muted">{counts[star].toLocaleString()}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {STARS.map((star) => {
          const active = selected.includes(star);
          return (
            <button
              key={star}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(star)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                active ? "border-forest bg-forest text-white" : "border-line text-forest"
              }`}
            >
              {star} <Star size={11} strokeWidth={0} className="fill-star" />
              <span className={active ? "text-white/70" : "text-muted"}>({counts[star]})</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
