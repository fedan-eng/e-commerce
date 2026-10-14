import { SoftCard } from "./ui";

// highlights: [{ icon, title, subtitle }] — see getHighlights() in productUtils
export default function ProductHighlights({ highlights }) {
  if (highlights.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {highlights.map(({ icon: Icon, title, subtitle }) => (
        <li key={title}>
          <SoftCard className="h-full min-h-[150px] rounded-[20px] p-[18px]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-muted">
              <Icon size={18} />
            </span>
            <p className="mt-5 text-[17px] font-bold leading-tight text-forest">{title}</p>
            {subtitle && <p className="mt-1 text-sm leading-snug text-muted">{subtitle}</p>}
          </SoftCard>
        </li>
      ))}
    </ul>
  );
}
