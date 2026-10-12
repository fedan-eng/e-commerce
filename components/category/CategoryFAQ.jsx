"use client";
// components/category/CategoryFAQ.jsx — "Questions about …"
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/categories";

export default function CategoryFAQ({ category }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-[1fr_2fr] md:px-16">
      {/* TODO: design */}
      <div>
        <h2 className="text-3xl font-semibold">{category.faqTitle}</h2>
        <p className="mt-2 text-sm text-gray-600">Quick answers before you buy.</p>

        <div className="mt-6 rounded-3xl bg-[#F3F7F2] p-6">
          <p className="font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-gray-600">Message us and a real person will reply.</p>
          <div className="mt-4 flex gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#004328] px-4 py-2 text-xs text-white"
            >
              Chat on WhatsApp
            </a>
            <a href="tel:+2347018900705" className="rounded-full border px-4 py-2 text-xs">
              Call us
            </a>
          </div>
        </div>
      </div>

      <ul>
        {category.faqs.map((faq, i) => (
          <li key={faq.q} className="border-b border-gray-200">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold"
            >
              {faq.q}
              {open === i ? <Minus size={16} /> : <Plus size={16} />}
            </button>
            {open === i && <p className="pb-5 text-sm text-gray-600">{faq.a}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
