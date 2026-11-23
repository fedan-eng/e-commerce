// components/category/ProductGrid.jsx
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import CategoryProductCard from "./CategoryProductCard";
import HelpCard from "./HelpCard";

export default function ProductGrid({ products, category }) {
  return (
    // Keyed by what's shown, so the cards come in again when a filter changes
    <Stagger key={`${products.length}-${products[0]?._id || ""}`} gap={0.07} className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3">
      {products.map((p) => (
        <StaggerItem key={p._id} pop className="min-w-0">
          <CategoryProductCard product={p} cardBg={category.theme.cardBg} />
        </StaggerItem>
      ))}
      {products.length === 0 && (
        <p className="col-span-full py-12 text-center text-sm text-gray-500">
          No products match these filters.
        </p>
      )}
      <StaggerItem pop className="min-w-0">
        <HelpCard helpCard={category.helpCard} />
      </StaggerItem>
    </Stagger>
  );
}
