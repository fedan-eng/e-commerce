// lib/revalidate.js — refresh cached storefront pages after data changes
import { revalidatePath } from "next/cache";

// Rebuild a product's details page on its next visit (call after reviews,
// edits or sales change what that page shows). Never throws: a failed
// refresh only means the page catches up at its normal hourly revalidate.
export function revalidateProduct(productId) {
  try {
    revalidatePath(`/products/${productId}`);
  } catch (err) {
    console.error(`revalidateProduct(${productId}) failed:`, err);
  }
}
