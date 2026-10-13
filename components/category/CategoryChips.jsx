"use client";
// components/category/CategoryChips.jsx — quick-filter pills above the grid
// Inactive chips use the category's colours (theme.chipBg / theme.chipBorder); the active one is dark green.

function isActive(chip, selected) {
  const chipKeys = Object.keys(chip.set);
  const selectedKeys = Object.keys(selected);
  if (!chipKeys.length) return !selectedKeys.length; // the "All" chip
  return (
    chipKeys.length === selectedKeys.length &&
    chipKeys.every(
      (k) =>
        selected[k]?.length === chip.set[k].length &&
        chip.set[k].every((id) => selected[k].includes(id))
    )
  );
}

export default function CategoryChips({ chips, selected, onSelect, theme }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap">
      {chips.map((chip) => {
        const active = isActive(chip, selected);
        return (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.set)}
            aria-pressed={active}
            className="shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
            style={
              active
                ? { backgroundColor: "#004328", borderColor: "#004328", color: "#fff" }
                : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder, color: "#0A321B" }
            }
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
