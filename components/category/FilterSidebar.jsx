"use client";
// components/category/FilterSidebar.jsx
// Results update as boxes are ticked (live). "Apply" still applies the current selection.
import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[12px] text-[#4A4A4A] hover:text-[#0A321B]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1FA34A]/40 ${
          checked ? "border-[#1FA34A] bg-[#1FA34A]" : "border-[#CFE3D6] bg-white"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3.5} className="text-white" />}
      </span>
      {label}
    </label>
  );
}

function FilterGroup({ filter, draft, onToggle, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const values = draft[filter.key] || [];

  return (
    <div className="border-b border-[#E3EDE6] py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-[13px] font-bold text-[#0A321B]"
      >
        {filter.label}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="mt-2.5 space-y-1">
          {filter.options.map((opt) => (
            <FilterCheckbox
              key={opt.id}
              label={opt.label}
              checked={values.includes(opt.id)}
              onChange={() => onToggle(filter.key, opt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// applyLabel / onDone: used by the mobile filter sheet ("Show 6 products", then close)
export default function FilterSidebar({ filters, selected, onApply, applyLabel = "Apply", onDone }) {
  const [draft, setDraft] = useState(selected);

  // Keep the draft in sync when the URL changes (chips, back button)
  useEffect(() => setDraft(selected), [selected]);

  const toggle = (key, id) => {
    const current = draft[key] || [];
    const values = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    const next = { ...draft, [key]: values };
    setDraft(next);
    onApply(next, { live: true });
  };

  const clear = () => {
    setDraft({});
    onApply({});
  };

  return (
    <aside className="w-full shrink-0 md:w-[240px]">
      <div className="flex items-center justify-between border-b border-[#E3EDE6] pb-3">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-[#0A321B]">
          <SlidersHorizontal size={14} /> Clear filter
        </span>
        <button onClick={clear} className="text-[12px] font-semibold text-[#1FA34A] hover:underline">
          Clear
        </button>
      </div>

      {/* First three groups start open; the rest stay shut until tapped */}
      {filters.map((f, i) => (
        <FilterGroup key={f.key} filter={f} draft={draft} onToggle={toggle} defaultOpen={i < 3} />
      ))}

      <div className="mt-6 flex gap-3">
        <button
          onClick={clear}
          className="flex-1 rounded-full border border-[#D6E2DA] bg-white py-2.5 text-[12px] font-semibold text-[#0A321B] hover:border-[#0A321B]"
        >
          Clear
        </button>
        <button
          onClick={() => {
            onApply(draft);
            onDone?.();
          }}
          className="flex-1 rounded-full bg-[#004328] py-2.5 text-[12px] font-semibold text-white hover:bg-black"
        >
          {applyLabel}
        </button>
      </div>
    </aside>
  );
}
