// lib/revalidate.js — refresh cached storefront pages after data changes
import { revalidatePath } from "next/cache";
import { CATEGORY_SLUGS } from "@/lib/categories";

// Rebuild the pages that list products (the homepage's best sellers and every
// category page) on their next visit: call after a product is added, edited,
// reordered or sold. Never throws, like revalidateProduct.
export function revalidateStorefront() {
  for (const path of ["/", ...CATEGORY_SLUGS.map((slug) => `/products/${slug}`)]) {
    try {
      revalidatePath(path);
    } catch (err) {
      console.error(`revalidatePath(${path}) failed:`, err);
    }
  }
}

// Rebuild a product's details page on its next visit (call after reviews,
// edits or sales change what that page shows), plus the listings it appears in.
// Never throws: a failed refresh only means the page catches up at its normal
// hourly revalidate.
export function revalidateProduct(productId) {
  try {
    revalidatePath(`/products/${productId}`);
  } catch (err) {
    console.error(`revalidateProduct(${productId}) failed:`, err);
  }
  revalidateStorefront();
}
