"use client";

import React, { useState } from "react";
import Image from "next/image";

const ProductImage = ({
  src,
  alt = "",
  className = "",
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
      className={`relative overflow-hidden ${className}`}
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
        className={`object-cover absolute inset-0 w-full h-full transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};

export { ProductImage };