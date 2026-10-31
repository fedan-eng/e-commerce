// Colour swatches. Colour names double as CSS colours ("Purple", "Teal"…).
export default function ColorPicker({ colors, selected, onChange }) {
  if (!colors?.length) return null;

  return (
    <div>
      <p className="text-[15px] text-muted">
        <span className="font-semibold text-forest">Colour:</span> {selected?.name}
      </p>
      <div role="radiogroup" aria-label="Colour" className="mt-3 flex flex-wrap items-center gap-2.5">
        {colors.map((color) => {
          const active = selected?._id === color._id;
          return (
            <button
              key={color._id || color.name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={color.name}
              title={color.name}
              onClick={() => onChange(color)}
              className={`h-11 w-11 rounded-full border-2 p-[3px] transition-colors ${
                active ? "border-forest" : "border-transparent hover:border-line"
              }`}
            >
              <span
                className="block h-full w-full rounded-full ring-1 ring-black/5"
                style={{ backgroundColor: color.name?.toLowerCase() }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
