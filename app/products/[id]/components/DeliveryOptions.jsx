import { Info, MapPin, Package, Zap } from "lucide-react";
import { Pill, SoftCard } from "./ui";

const OPTIONS = [
  { icon: Package, title: "Regular delivery", detail: "3–5 working days" },
  { icon: Zap, title: "Express delivery", detail: "Within 24 hours for orders placed before 10am. Extra fee applies." },
  { icon: MapPin, title: "Free Thursday delivery", detail: "Every Thursday, within Lagos", free: true },
];

function DeliveryTimes() {
  return (
    <div className="group relative">
      <button type="button" className="flex items-center gap-1.5 text-[15px] font-medium text-forest">
        <Info size={16} /> Delivery times
      </button>
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 rounded-xl bg-forest p-3 text-[13px] leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        Lagos: 2–3 working days. Outside Lagos: 3–5 working days.
      </div>
    </div>
  );
}

export default function DeliveryOptions() {
  return (
    <SoftCard className="px-5 py-6 md:px-[22px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-forest">Delivery options</h3>
        <DeliveryTimes />
      </div>
      <ul className="flex flex-col gap-2.5">
        {OPTIONS.map(({ icon: Icon, title, detail, free }) => (
          <li key={title} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
            <Icon size={18} className="mt-0.5 shrink-0 self-start text-forest" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-forest">{title}</p>
              <p className="mt-1 text-sm text-muted">{detail}</p>
            </div>
            {free && <Pill tone="signal" className="font-semibold">Free</Pill>}
          </li>
        ))}
      </ul>
    </SoftCard>
  );
}
