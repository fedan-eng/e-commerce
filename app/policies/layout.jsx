import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Delivery, Payment, Returns & Warranty Policies | FIL Store Nigeria",
  description:
    "How FIL Store delivery, payment, returns and warranty work: 7-day returns, secure Paystack payment and delivery across Nigeria.",
  alternates: { canonical: `${SITE_URL}/policies` },
};

export default function PoliciesLayout({ children }) {
  return children;
}
