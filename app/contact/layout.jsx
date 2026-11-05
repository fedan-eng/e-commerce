import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Contact Us - Customer Support & Store Locations | FIL Store Nigeria",
  description: "Get in touch with FIL Store Nigeria. Customer support, store locations in Lagos, Abuja, Port Harcourt. Email, phone, WhatsApp support. We're here to help with your tech product needs.",
  keywords: "contact FIL Store, customer support Nigeria, tech store Lagos, FIL Store location, phone number, email",
  alternates: { canonical: `${SITE_URL}/contact` },
  
  openGraph: {
    title: "Contact FIL Store Nigeria",
    description: "Get in touch with our customer support team. We're here to help!",
    url: `${SITE_URL}/contact`,
    siteName: 'FIL Store',
    locale: 'en_NG',
    type: 'website',
  },
};

export default function ContactLayout({ children }) {
  return children;
}
