"use client";
import { useState, useEffect } from "react";

export default function PriceRange({ min = 0, max = 500000, onChange }) {
  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  // Format numbers with commas
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);

  // 🔹 Notify parent when values change
  useEffect(() => {
    if (onChange) {
      onChange({ minPrice, maxPrice });
    }
  }, [minPrice, maxPrice]);

  const resetPrices = () => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-xs">Price</h3>

        {/* Reset button */}
        {(minPrice !== min || maxPrice !== max) && (
          <button
            onClick={resetPrices}
            className="font-medium text-filgreen text-xs cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
      {/* Range slider container */}
      <div className="relative bg-gray-300 mb-4 rounded-md w-full h-1">
        {/* Track fill */}
        <div
          className="absolute bg-black rounded-md h-1"
          style={{
            left: `${(minPrice / max) * 100}%`,
            right: `${100 - (maxPrice / max) * 100}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={minPrice}
          onChange={(e) =>
            setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))
          }
          className="absolute bg-transparent w-full h-1 appearance-none pointer-events-none"
          style={{ zIndex: minPrice > max - 100 ? "5" : "3" }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))
          }
          className="absolute bg-transparent w-full h-1 appearance-none pointer-events-none"
        />

        {/* Thumb styles */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            border: 3px solid black;
            background: white;
            cursor: pointer;
            pointer-events: auto;
          }
          input[type="range"]::-moz-range-thumb {
            height: 12px;
            width: 12px;
            border-radius: 50%;
            border: 3px solid black;
            background: white;
            cursor: pointer;
            pointer-events: auto;
          }
        `}</style>
      </div>

      {/* Min & Max inputs */}
      <div className="flex gap-2 w-full">
        <div className="flex items-center px-1 py-1 border border-[#d9d9d9] rounded-md w-1/2 text-xs">
          <p className="font-bold">₦</p>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(
                Math.min(Number(e.target.value) || min, maxPrice - 100)
              )
            }
            className="p-1 border-transparent rounded outline-none w-full appearance-none"
          />
        </div>
        <div className="flex items-center px-1 py-1 border border-[#d9d9d9] rounded-md w-1/2 text-xs">
          <p className="font-bold">₦</p>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(
                Math.max(Number(e.target.value) || max, minPrice + 100)
              )
            }
            className="p-1 border-transparent rounded outline-none w-full appearance-none"
          />
        </div>
      </div>

      {/* Display formatted values */}
      <div className="flex justify-between mt-2 text-gray-600 text-xs">
        <span>{formatCurrency(minPrice)}</span>
        <span>{formatCurrency(maxPrice)}</span>
      </div>
    </div>
  );
}
