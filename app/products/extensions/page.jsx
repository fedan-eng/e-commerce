// Extensions are hidden while there's no stock — the page 404s.
// To bring it back, restore the commented code below and remove "extensions" from HIDDEN_FROM_STORE in lib/categories.js.
import { notFound } from "next/navigation";
// import CategoryPage from "@/components/category/CategoryPage";
// import { buildCategoryMetadata } from "@/lib/categories";

// export const revalidate = 3600;

// export const metadata = buildCategoryMetadata("extensions");

export default function Page() {
  notFound();
  // return <CategoryPage slug="extensions" />;
}
