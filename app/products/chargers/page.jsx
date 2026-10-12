import CategoryPage from "@/components/category/CategoryPage";
import { buildCategoryMetadata } from "@/lib/categories";

export const revalidate = 3600;

export const metadata = buildCategoryMetadata("chargers");

export default function Page() {
  return <CategoryPage slug="chargers" />;
}
