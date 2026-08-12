"use client";

import React, { useState } from "react";
import Image from "next/image";

const ProductImage = ({
  src,
  alt = "",
  containerClassName = "", // for the wrapper div
  imageClassName = "",     // for the actual image
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  aspectRatio = "1/1",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      style={fill ? { aspectRatio } : { width, height }}
    >
      {/* Placeholder */}
      <div
        className={`absolute inset-0 bg-gray-200 flex items-center justify-center transition-opacity duration-300 ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="text-gray-400 text-xs">filstore.com.ng</span>
      </div>

      {/* Image */}
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes ?? (fill ? "100vw" : undefined)}
        priority={priority}
        // Changed object-cover to object-contain so product images don't crop
        className={`object-contain absolute inset-0 w-full h-full transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${imageClassName}`}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};

export { ProductImage };