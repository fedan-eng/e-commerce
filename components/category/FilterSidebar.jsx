"use client";
// components/category/FilterSidebar.jsx
// Checkbox changes are a local draft; "Apply" pushes them to the URL.
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

function FilterGroup({ filter, draft, onToggle }) {
  const [open, setOpen] = useState(true);
  const values = draft[filter.key] || [];

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold"
      >
        {filter.label}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {filter.options.map((opt) => (
            <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={values.includes(opt.id)}
                onChange={() => onToggle(filter.key, opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ filters, selected, onApply }) {
  const [draft, setDraft] = useState(selected);

  // Keep the draft in sync when the URL changes (chips, back button)
  useEffect(() => setDraft(selected), [selected]);

  const toggle = (key, id) => {
    setDraft((d) => {
      const current = d[key] || [];
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      return { ...d, [key]: next };
    });
  };

  const clear = () => {
    setDraft({});
    onApply({});
  };

  return (
    <aside className="w-full shrink-0 md:w-[260px]">
      {/* TODO: design + mobile drawer */}
      <div className="flex items-center justify-between pb-2">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <SlidersHorizontal size={14} /> Clear filter
        </span>
        <button onClick={clear} className="text-xs text-green-600">Clear</button>
      </div>

      {filters.map((f) => (
        <FilterGroup key={f.key} filter={f} draft={draft} onToggle={toggle} />
      ))}

      <div className="mt-4 flex gap-2">
        <button onClick={clear} className="flex-1 rounded-full border py-2 text-xs">Clear</button>
        <button
          onClick={() => onApply(draft)}
          className="flex-1 rounded-full bg-[#004328] py-2 text-xs text-white"
        >
          Apply
        </button>
      </div>
    </aside>
  );
}
