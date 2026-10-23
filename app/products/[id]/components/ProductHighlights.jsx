// highlights: [{ icon, title, subtitle }] — see getHighlights() in productUtils
// Plain list with dividers: the value up top, what it means underneath
export default function ProductHighlights({ highlights }) {
  if (highlights.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {highlights.map(({ icon: Icon, title, subtitle }) => (
        <li key={title} className="flex gap-3 border-b border-line py-4 last:border-b-0">
          <Icon size={18} className="mt-[5px] shrink-0 text-muted" />
          <div className="min-w-0">
            <p className="text-[20px] leading-tight text-muted">{title}</p>
            {subtitle && <p className="mt-1 text-sm text-forest/80">{subtitle}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
