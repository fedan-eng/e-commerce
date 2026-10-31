"use client";

import { useState } from "react";
import { formatAmount } from "@/lib/utils";
import AddToCartButtonPDP from "@/components/AddToCartPDP";
import { getDiscount } from "../productUtils";
import { Pill, StarRating } from "./ui";
import ColorPicker from "./ColorPicker";
import QuantityStepper from "./QuantityStepper";
import ExpandableText from "./ExpandableText";
import { Specifications } from "./ProductSpecs";

function Badges({ product, discount }) {
  const badges = [
    discount && { tone: "dark", label: `Save ${discount.percent}%` },
    product.isWhatsNew && { tone: "mint", label: "New arrival" },
    product.isBestseller && { tone: "mint", label: "Bestseller" },
  ].filter(Boolean);

  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <Pill key={b.label} tone={b.tone}>{b.label}</Pill>
      ))}
    </div>
  );
}

function RatingLine({ product }) {
  const { averageRating = 0, ratingsCount = 0, soldCount = 0 } = product;
  if (!ratingsCount && !soldCount) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
      {ratingsCount > 0 && (
        <>
          <StarRating value={averageRating} size={15} />
          <span className="font-semibold text-forest">{averageRating.toFixed(1)}</span>
          <a href="#reviews-section" className="font-medium text-forest underline underline-offset-2">
            {ratingsCount.toLocaleString()} review{ratingsCount === 1 ? "" : "s"}
          </a>
        </>
      )}
      {soldCount > 0 && <span className="text-muted">{soldCount.toLocaleString()} sold</span>}
    </div>
  );
}

function PriceLine({ product, discount }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[24px] font-bold leading-none text-forest sm:text-[30px] md:text-[34px]">{formatAmount(product.price)}</span>
      {discount && (
        <>
          <span className="text-sm text-muted line-through sm:text-base">{formatAmount(product.originalPrice)}</span>
          <Pill tone="mint">You save {formatAmount(discount.amount)}</Pill>
        </>
      )}
    </div>
  );
}

// Rendered by the page, between the delivery and services cards
export function StockStatus({ inStock }) {
  return (
    <p className="flex items-center gap-2 text-[13px] text-muted sm:text-[15px]">
      <span className={`h-3 w-3 rounded-full ring-4 ${inStock ? "bg-signal ring-mint" : "bg-red-500 ring-red-100"}`} />
      {inStock ? "In stock, ships from Lagos" : "Out of stock"}
    </p>
  );
}

export default function ProductInfo({ product, highlights, selectedColor, onColorChange, onCheckout }) {
  const [quantity, setQuantity] = useState(1);
  const discount = getDiscount(product);
  const inStock = product.availability !== false;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:gap-4 sm:pb-6">
        <Badges product={product} discount={discount} />
        <h1 className="text-[22px] font-bold leading-[1.2] tracking-tight text-forest sm:text-[28px] md:text-[36px]">{product.name}</h1>
        <RatingLine product={product} />
        <PriceLine product={product} discount={discount} />
      </div>

      {product.description && (
        <div className="mt-5 sm:mt-7">
          <h2 className="text-[14px] sm:text-[15px] font-semibold text-forest">Description</h2>
          <ExpandableText text={product.description} className="mt-2 text-[14px] leading-[1.6] text-muted sm:text-base sm:leading-[1.65]" />
        </div>
      )}

      {highlights.length > 0 && (
        <div className="mt-5 sm:mt-7">
          <Specifications highlights={highlights} />
        </div>
      )}

      <div className="mt-6">
        <ColorPicker colors={product.colors} selected={selectedColor} onChange={onColorChange} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 sm:flex-nowrap">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        {inStock && (
          <button
            type="button"
            onClick={() => onCheckout(quantity)}
            className="order-last h-12 basis-full rounded-full bg-forest px-8 text-[15px] font-medium sm:h-[52px] sm:text-[17px] text-white transition-colors hover:bg-[#002a19] sm:order-none sm:basis-auto sm:flex-1"
          >
            Checkout now
          </button>
        )}
        <AddToCartButtonPDP
          product={product}
          selectedColor={selectedColor}
          quantity={quantity}
          className="flex-1 sm:flex-none sm:px-8"
        />
      </div>
    </div>
  );
}
