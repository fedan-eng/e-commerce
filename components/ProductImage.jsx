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
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder */}
      <div 
        className={`absolute inset-0 bg-gray-200 flex items-center justify-center transition-opacity duration-400 ease-in-out ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-gray-400 text-sm">filstore.com.ng</span>
      </div>
      
      {/* Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`transition-opacity duration-400 ease-in-out ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};

export { ProductImage };
