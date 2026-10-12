// components/category/ProductGrid.jsx
import CategoryProductCard from "./CategoryProductCard";
import HelpCard from "./HelpCard";

export default function ProductGrid({ products, category }) {
  return (
    <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-3">
      {/* TODO: design */}
      {products.map((p) => (
        <CategoryProductCard key={p._id} product={p} accent={category.accent} />
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
