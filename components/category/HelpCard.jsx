// components/category/HelpCard.jsx — the dark green "Not sure which…" card in the grid
import { WHATSAPP_URL } from "@/lib/categories";

export default function HelpCard({ helpCard }) {
  return (
    <div className="flex flex-col rounded-3xl bg-[#004328] max-h-[230px] p-6 text-white">
      {/* TODO: design */}
      <h3 className="text-2xl font-semibold">{helpCard.title}</h3>
      <p className="mt-3 text-sm text-white/80">{helpCard.text}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-fit rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-[#004328]"
      >
        Ask on WhatsApp
      </a>
    </div>
  );
}
