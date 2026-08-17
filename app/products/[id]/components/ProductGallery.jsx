"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Share, CheckCircle, Zap, Shield, AlertTriangle, Usb, Truck, Info } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import WishlistButtonPD from "@/components/WishlistButtonPD";

// ─── Feature Icon Helper ───────────────────────────────────────────────────────
const getFeatureIcon = (feature) => {
  const f = feature.toLowerCase();
  if (f.includes("fast") && f.includes("charg"))
    return <Zap className="w-8 h-8" />;
  if (f.includes("protect") && f.includes("heat"))
    return <Shield className="w-8 h-8" />;
  if (f.includes("overload") && f.includes("protect"))
    return <AlertTriangle className="w-8 h-8" />;
  if (f.includes("type") && f.includes("c") && f.includes("port"))
    return <Usb className="w-8 h-8" />;
  if (f.includes("fast") && f.includes("delivery"))
    return <Truck className="w-8 h-8" />;
  if (f.includes("return")) return <AlertTriangle className="w-8 h-8" />;
  if (f.includes("support")) return <Info className="w-8 h-8" />;
  if (f.includes("quality")) return <Shield className="w-8 h-8" />;
  return <CheckCircle className="w-8 h-8" />;
};

function ProductGallery({ product, selectedColor, onFullViewImage, onShareModal }) {
  const [selectedImageId, setSelectedImageId] = useState("main");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  // Map all images from all colors into the carousel with unique IDs
  const colorImages = product.colors?.flatMap((color, colorIdx) =>
    (color.images || []).map((img, imgIdx) => ({
      id: `${color._id}-${imgIdx}`,
      url: img,
      colorName: color.name
    }))
  ) || [];
  
  const secondaryImagesWithIds = (product.secondaryImages || []).map((img, idx) => ({
    id: `secondary-${idx}`,
    url: img
  }));
  
  const currentImages = [
    { id: "main", url: product.image },
    ...colorImages,
    ...secondaryImagesWithIds
  ];
  
  const selectedImage = currentImages.find(img => img.id === selectedImageId)?.url || product.image;

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setZoomOrigin({ x, y });
      setIsZoomed(true);
    }
  };

  return (
    <div className="flex flex-col mx-5 md:max-w-[50%] items-center gap-4 md:gap-10 mt-3 md:mt-12 basis-[546px]">
      {/* Main Image */}
      <div className="flex w-full gap-3">
        <div
          className="flex-1 aspect-square max-h-[480px] overflow-hidden relative bg-[#fafafa] rounded-lg"
          style={{ cursor: isZoomed ? "zoom-out" : "zoom-in" }}
        >
          {selectedImage ? (
            <ProductImage
              src={selectedImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              priority
              containerClassName="w-full h-full"
              imageClassName={`object-contain transition-transform duration-300 ease-out ${
                isZoomed ? "scale-[2]" : "scale-100"
              }`}
              style={{
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
              onClick={handleImageClick}
              draggable={false}
            />
          ) : (
            <div className="flex justify-center items-center w-full h-full text-gray-400 bg-gray-100">
              <p className="text-sm">Image not available</p>
            </div>
          )}
        </div>

        {/* Side Actions */}
        <div className="flex flex-col justify-between items-center py-2">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onShareModal(true)}
              className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share className="w-4 h-4 text-gray-600" />
            </button>
            <WishlistButtonPD
              product={product}
              selectedColor={selectedColor}
              className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            />
            <button
              onClick={() => onFullViewImage(selectedImage)}
              className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Full view"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const i = currentImages.findIndex(img => img.id === selectedImageId);
                const newImage = currentImages[i === 0 ? currentImages.length - 1 : i - 1];
                setSelectedImageId(newImage.id);
                setIsZoomed(false);
              }}
              className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => {
                const i = currentImages.findIndex(img => img.id === selectedImageId);
                const newImage = currentImages[i === currentImages.length - 1 ? 0 : i + 1];
                setSelectedImageId(newImage.id);
                setIsZoomed(false);
              }}
              className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex md:justify-center gap-3 pt-4 pb-2 w-full overflow-x-auto px-4 sm:px-0">
        {currentImages.map((img) => (
          <button
            key={img.id}
            onClick={() => {
              setSelectedImageId(img.id);
              setIsZoomed(false);
            }}
            className={`w-[65px] bg-[#fafafa] h-[65px] flex-shrink-0 rounded-lg border-2 overflow-hidden p-1.5 transition-all ${
              selectedImageId === img.id
                ? "border-filgreen"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <ProductImage
              src={img.url}
              alt={`Thumbnail`}
              width={65}
              height={65}
              className="w-full h-full object-contain"
              loading="lazy"
              sizes="65px"
              quality={75}
            />
          </button>
        ))}
      </div>

      {/* Product Features */}
      {product.features?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6 w-full border-t border-gray-200 pt-6">
          {product.features.slice(0, 4).map((feat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center gap-2"
            >
              {getFeatureIcon(feat)}
              <span className="text-xs font-medium text-gray-700">
                {feat}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;