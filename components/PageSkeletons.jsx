// components/PageSkeletons.jsx
// Placeholders for content that loads inside a page. Shapes roughly follow the real
// content so the layout doesn't jump when it arrives. Page-to-page loads use
// RouteLoader instead.

function Block({ className = "" }) {
  return <div className={`rounded-2xl bg-gray-200 ${className}`} />;
}

function Busy({ label, className = "", children }) {
  return (
    <div role="status" aria-busy="true" className={`animate-pulse ${className}`}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// The filterable product grid on category pages (CategoryShop), which renders in the browser
export function CategoryShopSkeleton() {
  return (
    <Busy label="Loading products…" className="mx-auto max-w-[1440px] px-4 py-8 md:px-16">
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <Block key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <Block className="hidden h-96 w-[220px] shrink-0 md:block" />
        <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <Block className="aspect-square w-full" />
              <Block className="mt-3 h-4 w-3/4" />
              <Block className="mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </Busy>
  );
}
