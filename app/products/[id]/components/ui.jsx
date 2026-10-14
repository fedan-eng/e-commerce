// Small presentational building blocks shared across the product details sections.
import { Star } from "lucide-react";

export function Container({ className = "", children }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function SectionHeading({ title, subtitle, className = "" }) {
  return (
    <div className={className}>
      <h2 className="text-[28px] font-bold leading-tight tracking-tight text-forest md:text-[36px]">{title}</h2>
      {subtitle && <p className="mt-1 text-[15px] text-muted md:text-base">{subtitle}</p>}
    </div>
  );
}

export function StarRating({ value = 0, size = 14, gap = "gap-1", className = "" }) {
  const filled = Math.round(value);
  return (
    <div className={`flex items-center ${gap} ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          className={i <= filled ? "fill-star" : "fill-star-empty"}
        />
      ))}
    </div>
  );
}

const PILL_TONES = {
  dark: "bg-forest text-white",
  mint: "bg-mint text-forest",
  white: "bg-white text-forest",
  signal: "bg-signal text-forest",
};

export function Pill({ tone = "mint", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium leading-none ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// White round button used on top of image tiles (share, wishlist, next)
export function CircleButton({ label, className = "", children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest shadow-[0_2px_8px_rgba(0,67,40,0.08)] transition-transform hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Light rounded card: Services, Delivery, Highlights
export function SoftCard({ className = "", children }) {
  return <div className={`rounded-[24px] bg-sage ${className}`}>{children}</div>;
}
