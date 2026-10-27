// components/PageSkeletons.jsx
// Placeholders for the route loading.jsx files: shown straight away when a link is
// clicked, while the next page renders. Shapes roughly follow the real pages so the
// layout doesn't jump when content arrives.

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

// Any page without its own skeleton (cart, contact, blog, profile, …)
export function PageSkeleton() {
  return (
    <Busy label="Loading…" className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 md:pt-12">
      <Block className="h-9 w-2/3 max-w-sm md:h-12" />
      <Block className="mt-3 h-4 w-1/2 max-w-xs" />
      <div className="mt-10 space-y-4">
        <Block className="h-24 w-full" />
        <Block className="h-24 w-full" />
        <Block className="h-24 w-full" />
      </div>
    </Busy>
  );
}

// /products/[id]: breadcrumbs, gallery on the left, buy box on the right
export function ProductPageSkeleton() {
  return (
    <Busy label="Loading product…" className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-5 sm:px-6 md:pt-8">
      <Block className="h-4 w-48 rounded-full" />
      <div className="mt-5 grid grid-cols-1 gap-8 md:mt-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Block className="aspect-square w-full rounded-[28px]" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Block key={i} className="h-16 w-16 sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Block className="h-6 w-24 rounded-full" />
          <Block className="h-10 w-4/5" />
          <Block className="h-4 w-32" />
          <Block className="h-8 w-40" />
          <div className="space-y-2 pt-2">
            <Block className="h-4 w-full" />
            <Block className="h-4 w-11/12" />
            <Block className="h-4 w-3/4" />
          </div>
          <div className="flex gap-3 pt-2">
            {[0, 1, 2].map((i) => (
              <Block key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
          <Block className="h-12 w-full rounded-full" />
          <Block className="h-12 w-full rounded-full" />
          <Block className="h-32 w-full" />
        </div>
      </div>
    </Busy>
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

// /products/<category>: hero banner, then a grid of product cards
export function CategoryPageSkeleton() {
  return (
    <Busy label="Loading products…">
      <div className="min-h-[300px] bg-gray-200 sm:min-h-[340px] lg:min-h-[400px]" />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <Block className="h-8 w-2/3 max-w-md md:h-10" />
        <Block className="mt-3 h-4 w-1/2 max-w-sm" />
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-5 md:gap-6 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i}>
              <Block className="aspect-square w-full rounded-[20px] sm:rounded-[28px]" />
              <Block className="mt-3 h-4 w-3/4" />
              <Block className="mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </Busy>
  );
}
