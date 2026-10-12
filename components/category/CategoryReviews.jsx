"use client";
// components/category/CategoryReviews.jsx — "What customers say about our …"
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

export default function CategoryReviews({ category, reviews }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  if (!reviews.length) return null;

  return (
    <section className="bg-[#F3F7F2] py-12">
      {/* TODO: design */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold">What customers say about our {category.title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Real reviews from people using FIL {category.title} every day.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} aria-label="Previous" className="rounded-full border p-2">
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => scroll(1)} aria-label="Next" className="rounded-full border p-2">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div ref={scroller} className="mt-6 flex gap-4 overflow-x-auto scroll-smooth">
          {reviews.map((r) => (
            <article key={r._id} className="flex w-[320px] shrink-0 flex-col rounded-3xl bg-white p-6">
              <Quote size={28} />
              <p className="mt-4 flex-1 text-sm italic text-gray-600">{r.text}</p>
              <p className="mt-4 text-sm font-semibold">FIL customer</p>
              <p className="text-xs text-gray-500 underline">Bought {r.productName}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
