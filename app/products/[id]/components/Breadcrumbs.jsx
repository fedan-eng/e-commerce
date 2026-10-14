import Link from "next/link";

// items: [{ label, href? }] — the last item is the current page
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto no-scrollbar">
      <ol className="flex items-center gap-2 whitespace-nowrap text-[13px] text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-forest" : ""}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-forest">
                  {item.label}
                </Link>
              )}
              {!isLast && <span className="text-star-empty">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
