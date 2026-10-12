"use client";
// components/category/CategoryChips.jsx — quick-filter pills above the grid

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

export default function CategoryChips({ chips, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* TODO: design */}
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.set)}
          className={`rounded-full border px-4 py-2 text-xs font-medium ${
            isActive(chip, selected) ? "bg-[#004328] text-white" : "bg-white"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
