import { colorInStock } from "@/lib/stock";

// Colour swatches. Colour names double as CSS colours ("Purple", "Teal"…).
// Sold-out colours stay clickable (to see their photos) but are crossed out.
export default function ColorPicker({ colors, selected, onChange }) {
  if (!colors?.length) return null;
  const selectedSoldOut = selected && !colorInStock(selected);

  return (
    <div>
      <p className="text-[15px] text-muted">
        <span className="font-semibold text-forest">Colour:</span> {selected?.name}
        {selectedSoldOut && <span className="font-medium text-red-600"> — out of stock</span>}
      </p>
      <div role="radiogroup" aria-label="Colour" className="mt-3 flex flex-wrap items-center gap-2.5">
        {colors.map((color) => {
          const active = selected?._id === color._id;
          const soldOut = !colorInStock(color);
          const label = soldOut ? `${color.name} (out of stock)` : color.name;
          return (
            <button
              key={color._id || color.name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              title={label}
              onClick={() => onChange(color)}
              className={`relative h-11 w-11 rounded-full border-2 p-[3px] transition-colors ${
                active ? "border-forest" : "border-transparent hover:border-line"
              }`}
            >
              <span
                className={`block h-full w-full rounded-full ring-1 ring-black/5 ${soldOut ? "opacity-40" : ""}`}
                style={{ backgroundColor: color.name?.toLowerCase() }}
              />
              {soldOut && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-500 ring-1 ring-white"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
