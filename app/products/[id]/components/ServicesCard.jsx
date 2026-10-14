import Image from "next/image";
import { CreditCard, Headset, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { SoftCard } from "./ui";

const SERVICES = [
  { icon: Truck, label: "Fast and reliable delivery" },
  { icon: Headset, label: "24/7 support on WhatsApp" },
  { icon: Undo2, label: "7-day returns" },
  { icon: ShieldCheck, label: "Quality you can trust, years in the market" },
];

function Row({ icon: Icon, children }) {
  return (
    <li className="flex min-h-11 items-center gap-3.5 border-b border-line py-2.5 text-base text-forest last:border-b-0">
      <Icon size={18} className="shrink-0" />
      {children}
    </li>
  );
}

export default function ServicesCard() {
  return (
    <SoftCard className="px-5 py-6 md:px-[22px]">
      <h3 className="mb-2 text-base font-semibold text-forest">Services and benefits</h3>
      <ul>
        {SERVICES.map((s) => (
          <Row key={s.label} icon={s.icon}>{s.label}</Row>
        ))}
        <Row icon={CreditCard}>
          <span className="flex-1">Payment</span>
          <span className="flex h-[26px] items-center rounded-full border border-forest bg-white px-2.5">
            <Image src="/paystack.png" alt="Paystack" width={52} height={24} className="h-6 w-auto" />
          </span>
        </Row>
      </ul>
    </SoftCard>
  );
}
