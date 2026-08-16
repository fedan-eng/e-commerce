"use client";

import { useState } from "react";
import { CreditCard, Truck, Info } from "lucide-react";
import Image from "next/image";
import { formatAmount } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCart";
import BuyNow from "@/components/BuyNow";
import ExpandableDescription from "./ExpandableDescription";

function ProductDetailsInfo({ product, selectedColor, onColorChange, onBuyNow }) {
  const points = [
    {img: "/express.png", text: "Fast And Reliable Delivery"},
    {img: "/calender.png", text: "7 Days Return"},
    {img: "/support.png", text: "24/7 Support"},
    {img: "/certified.png", text: "Best Quality from many years in the market"},
  ];

  const deliveryOptions = [
    {text: "Regular Delivery: 2–3 Days (Lagos), 3–5 Days (Interstate)"},
    {text: "Express Delivery (Within 24 hours, for orders placed before 10am)"},
  ];

  return (
    <div className="flex flex-col md:max-w-[50%] gap-5 p-4 sm:p-6 lg:p-8">
      {/* Save Badge */}
      {product.originalPrice > 0 && (
        <div className="border-2 border-black text-black text-xs font-medium px-4 py-1.5 rounded-full w-fit">
          Save{" "}
          {Math.round(
            ((product.originalPrice - product.price) /
              product.originalPrice) *
              100,
          )}
          %
        </div>
      )}

      {/* Title */}
      <h1 className="font-oswald font-medium text-2xl md:text-3xl text-gray-900">
        {product.name}
      </h1>

      {/* Price & Rating */}
      <div className="flex border-dashed pb-10 border-gray-200 border-b-3 flex-wrap items-center gap-3">
        {product.originalPrice > 0 && (
          <span className="text-gray-400 text-lg line-through">
            {formatAmount(product.originalPrice)}
          </span>
        )}
        <span className="font-semibold text-2xl text-gray-900">
          {formatAmount(product.price)}
        </span>
        <div className="flex items-center gap-1 ml-2">
          <svg
            className="text-orange-400"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-sm font-medium">
            {product.averageRating.toFixed(1)}
          </span>
        </div>
        {product.soldCount > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            {product.soldCount} sold
          </span>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="font-semibold text-sm text-gray-900 mb-1">
          Description:
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          <ExpandableDescription description={product.description} />
        </p>
      </div>

      {/* Colors */}
      {product.colors?.length > 0 && (
        <div>
          <p className="text-md font-bold text-gray-500 mb-2">
            Color:{" "}
            <span className="font-bold text-black">
              {selectedColor?.name || "Select a color"}
            </span>
          </p>
          <div className="flex items-center gap-3">
            {product.colors.map((color, idx) => (
              <button
                key={idx}
                className={`w-14 h-8 rounded-md transition-all ${
                  selectedColor === color
                    ? "ring-2 ring-gray-400 ring-offset-4"
                    : "ring-0"
                }`}
                style={{ backgroundColor: color.name.toLowerCase() }}
                onClick={() => {
                  onColorChange(color);
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <AddToCartButton
          className="flex-1 bg-[#1a1a1a] text-white font-medium py-3.5 px-6 rounded-lg hover:bg-black transition-colors text-sm"
          product={product}
          selectedColor={selectedColor}
        />
        <BuyNow
          className="flex-1 bg-white text-gray-900 font-medium py-3.5 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          product={product}
          onBuyNow={onBuyNow}
        />
      </div>

      {/* Services & Benefits */}
      <div className="mt-4">
        <h3 className="font-oswald font-medium text-xl mb-3">
          Services and Benefits
        </h3>
        <div className="space-y-0">
          {points.map((point, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 py-3 border-b border-gray-100"
            >
              <Image
                src={point.img}
                alt={point.text}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
              <p className="text-sm text-gray-700">{point.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="mt-2">
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <p className="text-sm text-gray-700">Payment method</p>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Image
            width={100}
            height={40}
            src="/paystack.png"
            alt="paystack"
          />
        </div>
      </div>

      {/* Delivery Method */}
      <div className="mt-2">
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <Truck className="w-7 h-7 text-gray-600" />
          <div className="flex items-center gap-2">
            <p className="text-black text-md font-bold">Delivery method</p>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-600 cursor-pointer" />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-80 p-3 shadow-2xl bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Delivery within Lagos is 2-3 working days and outside Lagos
                is 3-5 working days.
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-0">
          {deliveryOptions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 py-3 border-b border-gray-100"
            >
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsInfo;