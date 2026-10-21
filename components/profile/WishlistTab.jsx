"use client";
// components/profile/WishlistTab.jsx — saved products, with add to cart and remove.
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Trash2 } from "lucide-react";
import AddToCartButton from "@/components/AddToCart";
import { ProductImage } from "@/components/ProductImage";
import { removeFromWishlist } from "@/store/features/wishlistSlice";
import { formatAmount } from "@/lib/utils";

export default function WishlistTab() {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist.items);

  return (
    <section className="rounded-[24px] border border-line p-6 sm:p-8">
      <h2 className="text-xl font-bold text-forest">Wishlist</h2>
      <p className="mt-1 text-sm text-muted">
        {wishlist.length > 0 ? `${wishlist.length} saved ${wishlist.length === 1 ? "item" : "items"}` : "Things you've saved for later."}
      </p>

      {wishlist.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[20px] bg-sage px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-forest">
            <Heart size={24} />
          </span>
          <p className="mt-4 text-lg font-bold text-forest">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted">Tap the heart on any product to keep it here.</p>
          <Link
            href="/products/power-banks"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black"
          >
            Browse power banks
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {wishlist.map((product) => (
            <li key={product._id} className="flex items-center gap-3 rounded-[20px] bg-sage p-3">
              <Link href={`/products/${product._id}`} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white">
                <ProductImage src={product.image} alt={product.name} width={64} height={64} className="h-16 w-16 object-contain" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${product._id}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-forest">
                  {product.name}
                </Link>
                <p className="mt-0.5 text-sm font-bold text-forest">{formatAmount(product.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <AddToCartButton
                    product={{ ...product, availability: product.availability ?? true }}
                    label="Add to cart"
                    animated={false}
                    className="h-9 rounded-full bg-forest px-4 text-[13px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromWishlist(product._id))}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-filred"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
