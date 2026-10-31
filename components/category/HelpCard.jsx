// components/category/HelpCard.jsx — the dark green "Not sure which…" card in the grid
// Square, so it lines up with the product cards' image containers (not the whole card).
// On phones (2-column grid) it spans the full row instead, so the text has room.
import { WHATSAPP_URL } from "@/lib/categories";

export default function HelpCard({ helpCard }) {
  return (
    <div className="col-span-2 flex flex-col self-start rounded-[24px] bg-[#004328] p-6 text-white sm:col-span-1 sm:aspect-square sm:rounded-[28px] lg:p-7">
      <h3 className="text-[22px] font-bold leading-tight sm:text-[24px] lg:text-[26px]">
        {helpCard.title}
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed text-white/80 sm:text-sm">{helpCard.text}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 w-fit rounded-full bg-[#25D366] px-5 py-2.5 text-[13px] font-semibold text-[#004328] transition-colors hover:bg-[#1fbf5b]"
      >
        Ask on WhatsApp
      </a>
    </div>
  );
}
