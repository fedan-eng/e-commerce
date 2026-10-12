// components/category/TrustBar.jsx
import { Zap, BadgeCheck, ShieldCheck, RotateCcw, Award } from "lucide-react";

const ITEMS = [
  { icon: Zap, label: "Super Fast Charging" },
  { icon: BadgeCheck, label: "Certified Compatibility" },
  { icon: ShieldCheck, label: "Hassle-Free Warranty" },
  { icon: RotateCcw, label: "30-Day Money-Back Guarantee" },
  { icon: Award, label: "Long-Lasting Quality" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-gray-200">
      {/* TODO: design */}
      <ul className="mx-auto flex max-w-[1440px] gap-8 overflow-x-auto px-4 py-4 md:justify-between md:px-16">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex shrink-0 items-center gap-2 text-xs font-medium">
            <Icon size={16} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
