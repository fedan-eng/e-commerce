import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  const btn = "flex h-full w-10 items-center justify-center text-forest transition-opacity disabled:opacity-30";

  return (
    <div className="flex h-[52px] w-[120px] shrink-0 items-center justify-between rounded-full border border-[#b9cbc2] px-1">
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={16} />
      </button>
      <span aria-live="polite" className="text-[17px] font-semibold text-forest">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={16} />
      </button>
    </div>
  );
}
