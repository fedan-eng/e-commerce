// components/category/ProductGrid.jsx
import CategoryProductCard from "./CategoryProductCard";
import HelpCard from "./HelpCard";

export default function ProductGrid({ products, category }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
      {products.map((p) => (
        <CategoryProductCard key={p._id} product={p} cardBg={category.theme.cardBg} ctaBg={category.theme.ctaBg} />
      ))}
      {products.length === 0 && (
        <p className="col-span-full py-12 text-center text-sm text-gray-500">
          No products match these filters.
        </p>
      )}
      <HelpCard helpCard={category.helpCard} />
    </div>
  );
}
