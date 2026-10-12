import CategoryPage from "@/components/category/CategoryPage";
import { buildCategoryMetadata } from "@/lib/categories";

export const revalidate = 3600;

export const metadata = buildCategoryMetadata("wearables");

export default function Page() {
  return <CategoryPage slug="wearables" />;
}
