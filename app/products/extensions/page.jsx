import CategoryPage from "@/components/category/CategoryPage";
import { buildCategoryMetadata } from "@/lib/categories";

export const revalidate = 3600;

export const metadata = buildCategoryMetadata("extensions");

export default function Page() {
  return <CategoryPage slug="extensions" />;
}
