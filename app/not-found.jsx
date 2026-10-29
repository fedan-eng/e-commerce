// app/not-found.jsx — any URL with no page (and notFound() calls), in the store's look
import Link from "next/link";
import { ArrowRight, BatteryLow, MessageCircle } from "lucide-react";
import { STORE_CATEGORIES, WHATSAPP_URL } from "@/lib/categories";

export const metadata = { title: "Page not found | FIL", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[720px] flex-col items-center justify-center px-4 py-16 text-center font-roboto">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint text-forest">
        <BatteryLow size={30} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Error 404</p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-forest sm:text-[40px]">
        This page ran out of charge
      </h1>
      <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-muted">
        The link may be old or mistyped. Everything else is still powered up.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/"
          className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black"
        >
          Back to the shop <ArrowRight size={17} />
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-[52px] items-center justify-center gap-2 rounded-full border-2 border-forest px-8 text-[15px] font-semibold text-forest transition-colors hover:bg-sage"
        >
          <MessageCircle size={17} /> Ask us on WhatsApp
        </a>
      </div>

      <div className="mt-12 w-full">
        <p className="text-sm font-semibold text-forest">Or jump to a category</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {STORE_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/products/${c.slug}`}
                className="block rounded-full bg-sage px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-mint"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
