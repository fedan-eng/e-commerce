// components/category/TrustBar.jsx
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
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
      <Stagger as="ul" gap={0.07} className="mx-auto flex max-w-[1440px] gap-8 overflow-x-auto px-4 py-4 md:justify-between md:px-16">
        {ITEMS.map(({ icon: Icon, label }) => (
          <StaggerItem as="li" key={label} y={12} className="group flex shrink-0 items-center gap-2 text-xs font-medium">
            <Icon size={16} className="transition-transform duration-300 group-hover:scale-125" />
            {label}
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
