"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Share } from "lucide-react";
import { CircleButton } from "./ui";
import WishlistToggle from "./WishlistToggle";

const SWIPE_THRESHOLD = 40;

// Parent re-mounts this (via `key`) when the colour changes, so the index resets.
export default function ProductGallery({ product, images, imageBg, onShare, onOpenImage }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const total = images.length;
  const current = images[index];

  const go = (step) => setIndex((i) => (i + step + total) % total);

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      {/* Main image */}
      <div
        data-product-gallery-image
        className="relative aspect-square overflow-hidden rounded-[24px] md:rounded-[30px]"
        style={{ backgroundColor: imageBg }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {current && (
          <button
            type="button"
            onClick={() => onOpenImage(current)}
            aria-label="View full image"
            className="absolute inset-0 cursor-zoom-in"
          >
            <Image
              src={current}
              alt={product.name}
              fill
              priority
              quality={90}
              sizes="(min-width: 1024px) 620px, 100vw"
              className="object-contain p-[12%]"
            />
          </button>
        )}

        <div className="absolute right-4 top-4 flex flex-col gap-2.5 md:right-6 md:top-6">
          <CircleButton label="Share" onClick={onShare}>
            <Share size={17} />
          </CircleButton>
          <WishlistToggle product={product} />
        </div>

        {total > 1 && (
          <>
            <CircleButton
              label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 md:hidden"
            >
              <ArrowLeft size={17} />
            </CircleButton>
            <CircleButton
              label="Next image"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 md:right-6"
            >
              <ArrowRight size={17} />
            </CircleButton>
            <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1.5 text-[13px] font-medium text-forest md:bottom-6 md:left-6">
              {index + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails: five across, scroll if there are more */}
      {total > 1 && (
        <div className="no-scrollbar grid auto-cols-[calc((100%-4*0.625rem)/5)] grid-flow-col gap-2.5 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-[14px] border-2 transition-colors md:rounded-[18px] ${
                i === index ? "border-forest" : "border-transparent hover:border-line"
              }`}
              style={{ backgroundColor: imageBg }}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-contain p-[18%]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
