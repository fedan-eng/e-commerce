"use client";
import { FaWhatsapp } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import Tracking from "@/components/Tracking";
import CategoryFAQ from "@/components/category/CategoryFAQ";
import { WHATSAPP_URL } from "@/lib/categories";

const CHANNELS = [
  {
    icon: FaWhatsapp,
    title: "WhatsApp",
    text: "The quickest way to reach us",
    action: "Chat with us",
    href: WHATSAPP_URL,
    external: true,
  },
  {
    icon: Phone,
    title: "Call us",
    text: "Speak to someone on our team",
    action: "0701 890 0705",
    href: "tel:+2347018900705",
  },
  {
    icon: Mail,
    title: "Email",
    text: "Best for detailed questions",
    action: "filsmteam@gmail.com",
    href: "mailto:filsmteam@gmail.com",
  },
];

const STORES = [
  { name: "Ikeja", address: "3 Otigba St, Computer Village", phone: "0702 500 4757", tel: "+2347025004757" },
  { name: "Alaba", address: "20 Fedan St, Ojo, Lagos", phone: "0701 890 0705", tel: "+2347018900705" },
  { name: "Awka", address: "Awka, Anambra" },
];

const FAQS = {
  faqTitle: "Common questions",
  faqs: [
    {
      q: "What payment methods do you accept?",
      a: "You can pay by debit or credit card (Visa, Mastercard and more), bank transfer or USSD, all through Paystack.",
    },
    {
      q: "How long does delivery take?",
      a: "Most orders arrive within 1 to 3 business days in Lagos and 3 to 7 business days elsewhere in Nigeria. Delivery fees depend on your location and are shown at checkout.",
    },
    {
      q: "What is your return and refund policy?",
      a: "Defective or unused items can be returned within 7 days of delivery. Send us your order number and we'll guide you through it. Refunds are processed within 5 business days of receiving the item.",
    },
    {
      q: "Are your gadgets covered by a warranty?",
      a: "Yes. Most products come with a warranty of 6 months to 2 years depending on the item. Check the product page for details, and contact us if you need help with a claim.",
    },
    {
      q: "How do I know a product works with my phone?",
      a: "Each product page lists the devices and ports it supports. If you're unsure, message us on WhatsApp with your phone model and we'll tell you what fits.",
    },
  ],
};

export default function ContactPage() {
  return (
    <main className="font-roboto">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 md:pt-12">
        {/* ── Header ── */}
        <span className="inline-block rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest">
          Support
        </span>
        <h1 className="mt-4 text-[24px] font-bold tracking-tight text-forest sm:text-[30px] md:text-[40px]">We&apos;re here to help</h1>
        <p className="mt-1 max-w-xl text-[15px] text-muted">
          Questions about a product, an order or a return? Reach us the way that suits you and a real person will reply.
        </p>

        {/* ── Ways to reach us ── */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, text, action, href, external }) => (
            <a
              key={title}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col rounded-[24px] bg-sage p-6 transition-colors hover:bg-mint"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest">
                <Icon size={20} />
              </span>
              <p className="mt-4 text-lg font-bold text-forest">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
              <p className="mt-4 break-all text-sm font-semibold text-forest underline-offset-4 group-hover:underline">
                {action} →
              </p>
            </a>
          ))}
        </div>

        {/* ── Form + side column ── */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <ContactForm />

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
            <Tracking />

            <div className="rounded-[24px] border border-line p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
                  <MapPin size={18} />
                </span>
                <h2 className="text-lg font-bold text-forest">Visit a store</h2>
              </div>
              <ul className="mt-5 divide-y divide-line">
                {STORES.map((s) => (
                  <li key={s.name} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-[15px] font-semibold text-ink">{s.name}</p>
                    <p className="mt-0.5 text-sm text-muted">{s.address}</p>
                    {s.phone && (
                      <a href={`tel:${s.tel}`} className="mt-1 inline-block text-sm font-semibold text-forest hover:underline">
                        {s.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <CategoryFAQ category={FAQS} />
    </main>
  );
}
