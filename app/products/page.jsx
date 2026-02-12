import React from "react";
import ProductList from "@/components/ProductList";
import TextSlider from "@/components/TextSlider";

export const dynamic = "force-dynamic";

const Shop = () => {
  return (
    <div>
      <div className="overflow-hidden">
        <TextSlider className="bg-[#fafafa]" />
      </div>
      <ProductList />
    </div>
  );
};

export default Shop;
