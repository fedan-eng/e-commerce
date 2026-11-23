// components/landing/ComboDeals.jsx — "Combo Deals": every bundle in stock as a card with its
// art, price and a "Buy now" button that adds it to the cart. Two across on phones.
// A bundle with `href` is a preview (PREVIEW_BUNDLES in app/page.jsx): its button links there
// instead, since there's no product to add yet.
import Link from "next/link";
import { BundleBanner } from "@/components/cart/BundleCard";
import AddToCartButton from "@/components/AddToCart";
import { formatAmount } from "@/lib/utils";

const BUTTON = "mt-3 flex h-11 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60";

export default function ComboDeals({ bundles }) {
  if (!bundles?.length) return null;

  return (
    <section className="w-full bg-sage px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-[26px] font-bold tracking-tight text-forest sm:text-3xl md:text-4xl">Combo Deals</h2>
        <p className="mt-1 text-[15px] text-muted md:text-base">Steal 3 products for the price of 1.</p>

        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:mt-8 md:grid-cols-3 lg:grid-cols-4">
          {bundles.map((bundle) => {
            const href = bundle.href || `/products/${bundle._id}`;
            const original = bundle.originalPrice > bundle.price ? bundle.originalPrice : null;
            return (
              <li key={bundle._id} className="flex flex-col">
                <Link href={href} aria-label={bundle.name} className="block overflow-hidden rounded-[16px] border-[1.5px] border-[#014628] transition-transform hover:-translate-y-0.5">
                  <BundleBanner
                    variant="combo"
                    image={bundle.image}
                    name={bundle.name}
                    price={bundle.price}
                    originalPrice={original}
                    aspect="aspect-square"
                    sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
                  />
                </Link>

                <Link href={href} className="mt-3 border-b border-line pb-2.5 text-[15px] font-bold text-forest hover:underline">
                  {bundle.name}
                </Link>
                <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-lg font-extrabold text-forest">{formatAmount(bundle.price)}</span>
                  {original && <span className="text-xs text-[#b8c2bd] line-through">{formatAmount(original)}</span>}
                </p>

                {bundle.href ? (
                  <Link href={href} className={BUTTON}>Buy now</Link>
                ) : (
                  <AddToCartButton product={bundle} label="Buy now" className={BUTTON} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
