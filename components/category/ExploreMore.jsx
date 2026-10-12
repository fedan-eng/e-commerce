// components/category/ExploreMore.jsx — "Explore more from FIL" (all categories except the current one)
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function ExploreMore({ currentSlug }) {
  const others = Object.values(CATEGORIES).filter((c) => c.slug !== currentSlug);

  return (
    <section className="bg-[#F3F7F2] py-12">
      {/* TODO: design */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-16">
        <h2 className="text-3xl font-semibold">Explore more from FIL</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/products/${c.slug}`}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl p-4"
              style={{ backgroundColor: c.exploreBg }}
            >
              <span className="relative z-10 font-semibold">{c.title}</span>
              <Image src={c.exploreImage} alt={c.title} fill className="object-cover" />
              <span className="absolute bottom-4 left-4 z-10 rounded-full bg-white/80 p-2">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
