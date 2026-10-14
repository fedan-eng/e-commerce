import { Check } from "lucide-react";

export default function StepIndicator({ steps, current }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = current > num;
        const active = current === num;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  done ? "bg-mint text-forest" : active ? "bg-forest text-white" : "border border-line text-muted"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : num}
              </span>
              <span
                aria-current={active ? "step" : undefined}
                className={`whitespace-nowrap text-[13px] font-medium sm:text-sm ${active || done ? "text-forest" : "text-muted"}`}
              >
                {label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span className={`h-0.5 flex-1 rounded-full ${done ? "bg-forest" : "bg-line"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
