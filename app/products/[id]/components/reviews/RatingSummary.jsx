import { Star } from "lucide-react";
import { StarRating } from "../ui";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ value }) {
  return (
    <div className="relative h-[100px] w-[100px] shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0bd46f" />
            <stop offset="100%" stopColor="#9be8c0" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={RADIUS} fill="none" strokeWidth="10" className="stroke-sage" />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="url(#score-ring)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - value / 5)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[28px] font-bold text-forest">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function Bars({ breakdown, total }) {
  return (
    <ul className="flex w-full flex-col gap-2.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = breakdown[star];
        const pct = total ? (count / total) * 100 : 0;
        return (
          <li key={star} className="flex items-center gap-3 text-[13px] text-muted">
            <span className="flex w-7 shrink-0 items-center gap-1 font-medium text-forest">
              {star} <Star size={11} strokeWidth={0} className="fill-star" />
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-sage">
              <span className="block h-full rounded-full bg-forest" style={{ width: `${Math.max(pct, count ? 3 : 0)}%` }} />
            </span>
            <span className="w-10 shrink-0 text-right">{count.toLocaleString()}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function RatingSummary({ average, total, breakdown, action }) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-14">
      <div className="flex items-center gap-5 md:pl-5">
        <ScoreRing value={average} />
        <div>
          <StarRating value={average} size={14} />
          <p className="mt-2 text-sm text-muted">Based on {total.toLocaleString()} review{total === 1 ? "" : "s"}</p>
        </div>
      </div>
      <Bars breakdown={breakdown} total={total} />
      <div className="md:pr-10">{action}</div>
    </div>
  );
}
