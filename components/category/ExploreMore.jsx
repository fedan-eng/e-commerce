// components/category/ExploreMore.jsx — "Explore more from FIL" (all categories except the current one)
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/categories";

export default function ExploreMore({ currentSlug }) {
  const others = STORE_CATEGORIES.filter((c) => c.slug !== currentSlug);

  return (
    <section className="bg-[#F3F7F2] py-12 md:py-16">
      <div className="mx-auto max-w-[1440px] px-4 md:px-16">
        <h2 className="text-[28px] font-bold tracking-tight text-[#0A321B] sm:text-[36px]">
          Explore more from FIL
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/products/${c.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-[24px] p-4 sm:p-5"
              style={{ backgroundColor: c.theme.exploreBg }}
            >
              <span className="relative z-10 text-[15px] font-bold text-[#0A321B] sm:text-[17px]">{c.title}</span>
              <Image
                src={c.exploreImage}
                alt={c.title}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-contain object-right-bottom pl-10 pt-8 transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-4 left-4 z-10 rounded-full bg-white/60 p-2 text-[#0A321B]">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
