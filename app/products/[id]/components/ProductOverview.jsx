"use client";

import Image from "next/image";
import { Container, SectionHeading } from "./ui";

// Bento rhythm on desktop (3 columns), repeating every 7 tiles:
// [ wide | 1 ] [ 1 | 1 | 1 ] [ 1 | wide ]
const PATTERN_LENGTH = 7;
const WIDE_TILES = new Set([0, 6]);

function Tile({ item, wide, onOpenImage }) {
  const shape = `relative h-[240px] overflow-hidden rounded-[22px] bg-gradient-to-b from-[#0e3524] to-[#08241a] sm:h-[280px] lg:h-[330px] lg:rounded-[26px] ${
    wide ? "lg:col-span-2" : ""
  }`;

  if (item.type === "video") {
    return (
      <div className={shape}>
        <video src={item.src} className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" />
      </div>
    );
  }

  return (
    <button type="button" onClick={() => onOpenImage(item.src)} aria-label="View full image" className={`${shape} group cursor-zoom-in`}>
      <Image
        src={item.src}
        alt=""
        fill
        sizes={wide ? "(min-width: 1024px) 820px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </button>
  );
}

export default function ProductOverview({ productName, media, onOpenImage }) {
  if (!media.length) return null;

  return (
    <section className="bg-sage py-14 md:py-20">
      <Container>
        <SectionHeading title="Overview" subtitle={`Everything ${productName} does, up close.`} />
        <div className="mt-6 grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7">
          {media.map((item, i) => (
            <Tile key={item.src} item={item} wide={WIDE_TILES.has(i % PATTERN_LENGTH)} onOpenImage={onOpenImage} />
          ))}
        </div>
      </Container>
    </section>
  );
}
