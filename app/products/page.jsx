import React from "react";
import ProductList from "@/components/ProductList";
import TextSlider from "@/components/TextSlider";

export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }) {
  const category = searchParams.categories;
  const special = searchParams.specials;

  // Category-specific metadata
  const categoryMetadata = {
    "Power Bank": {
      title: "Power Banks in Nigeria - 5,000mAh to 60,000mAh | Fast Charging | FIL Store",
      description: "Buy original power banks in Nigeria. FIL Storm, Mag-Flex, Volt Cube, Thunder. 5,000mAh - 60,000mAh capacity. Magnetic wireless charging, solar power, fast charging. Free delivery in Lagos, Abuja, Port Harcourt. Shop authentic power banks at FIL Store.",
      keywords: "power bank Nigeria, portable charger Lagos, magnetic power bank, wireless charging, solar power bank Nigeria, 20000mah power bank, 50000mah power bank, buy power bank online Nigeria"
    },
    "Wearables": {
      title: "Wireless Earbuds & Wearables in Nigeria - ANC Noise Cancelling | FIL Store",
      description: "Shop wireless earbuds and wearables in Nigeria. FIL Gbedu Pods, ZenPods, Pulse 3, Neckband earbuds. Active Noise Cancellation (ANC), 40-hour playtime, water-resistant. Perfect for music, calls, and fitness. Fast delivery across Nigeria. Shop FIL Store.",
      keywords: "wireless earbuds Nigeria, ANC earbuds Lagos, noise cancelling earbuds, Bluetooth earbuds Nigeria, sports earbuds, gaming earbuds, buy earbuds online Nigeria"
    },
    "Chargers": {
      title: "Phone Chargers & Cables Nigeria - USB-C, Lightning, Fast Charging | FIL Store",
      description: "Buy original phone chargers and cables in Nigeria. FIL Turbo Charger, USB-C cables, Lightning cables, Micro USB, 3-in-1 cables. Fast charging, durable design. iPhone & Android compatible. 2-pin & 3-pin chargers. Nationwide delivery. Shop FIL Store.",
      keywords: "phone charger Nigeria, USB-C cable Lagos, iPhone charger, fast charger Nigeria, 3-in-1 cable, type-c cable, micro USB cable, buy charger online Nigeria"
    },
    "Lifestyle": {
      title: "Tech Lifestyle Products Nigeria - Solar Bulbs, Smart Gadgets | FIL Store",
      description: "Discover innovative tech lifestyle products in Nigeria. M'paneka Solar & Rechargeable Bulb, portable fans, smart home devices. Energy-efficient, portable, versatile. Perfect for home, outdoor, emergencies. Shop FIL Store Nigeria.",
      keywords: "solar bulb Nigeria, rechargeable bulb Lagos, smart gadgets, tech lifestyle Nigeria, portable lighting, emergency bulb, solar power Nigeria"
    },
    "Extensions": {
      title: "Extension Cables & Power Strips Nigeria - Surge Protection, USB Ports | FIL Store",
      description: "Buy quality extension cables, power strips, and surge protectors in Nigeria. FIL Guard, Hero Socket, Navy Socket, wireless charging extensions. Multi-socket outlets, USB charging ports. Protect your devices from power surges. Fast delivery in Lagos, Abuja. Shop FIL Store.",
      keywords: "extension cable Nigeria, power strip Lagos, surge protector Nigeria, multi socket, USB extension, wireless charging pad, buy extension online Nigeria"
    }
  };

  // Special/Filter pages metadata
  const specialMetadata = {
    isBestseller: {
      title: "Best Selling Products - Top Tech Items in Nigeria | FIL Store",
      description: "Shop our best-selling tech products in Nigeria. Most popular power banks, earbuds, chargers, and accessories. Customer favorites with proven quality. FIL Turbo Charger, Gbedu Pods, Volt Cube. Fast delivery nationwide. FIL Store bestsellers.",
      keywords: "best selling products Nigeria, top tech products Lagos, popular gadgets Nigeria, bestseller electronics, trending tech"
    },
    isWhatsNew: {
      title: "New Arrivals - Latest Tech Products in Nigeria | FIL Store",
      description: "Discover what's new at FIL Store! Latest power banks, wireless earbuds, chargers, and tech accessories just arrived in Nigeria. FIL Storm 60,000mAh, ZenPods, Pulse 3. Be the first to get the newest gadgets. Shop new arrivals now.",
      keywords: "new arrivals Nigeria, latest tech products, new gadgets Lagos, newest electronics Nigeria, new tech 2026"
    },
    isTodaysDeal: {
      title: "Today's Deals - Special Discounts on Tech Products | FIL Store Nigeria",
      description: "Grab today's exclusive deals on power banks, earbuds, chargers, and tech accessories. Up to 30% OFF! Limited time offers, flash sales. FIL Mag-Flex, Thunder, Gbedu Pods on sale. Don't miss out! Shop FIL Store Nigeria.",
      keywords: "tech deals Nigeria, flash sale Lagos, discounted electronics, special offers tech Nigeria, power bank discount, earbuds sale"
    }
  };

  if (special && specialMetadata[special]) {
    return {
      title: specialMetadata[special].title,
      description: specialMetadata[special].description,
      keywords: specialMetadata[special].keywords,
      openGraph: {
        title: specialMetadata[special].title,
        description: specialMetadata[special].description,
        url: `https://www.filstore.com.ng/products?specials=${special}`,
        siteName: 'FIL Store',
        locale: 'en_NG',
        type: 'website',
      },
    };
  }

  if (category && categoryMetadata[category]) {
    return {
      title: categoryMetadata[category].title,
      description: categoryMetadata[category].description,
      keywords: categoryMetadata[category].keywords,
      openGraph: {
        title: categoryMetadata[category].title,
        description: categoryMetadata[category].description,
        url: `https://www.filstore.com.ng/products?categories=${encodeURIComponent(category)}`,
        siteName: 'FIL Store',
        locale: 'en_NG',
        type: 'website',
      },
      alternates: {
        canonical: `https://www.filstore.com.ng/products?categories=${encodeURIComponent(category)}`,
      },
    };
  }

  // Default products page
  return {
    title: "Shop Tech Products in Nigeria - Power Banks, Earbuds, Chargers | FIL Store",
    description: "Shop quality tech products in Nigeria. Power banks, wireless earbuds, phone chargers, cables, extensions, and accessories. FIL brand products with warranty. Fast delivery across Lagos, Abuja, Port Harcourt. Authentic products, best prices. Think quality, think FIL.",
    keywords: "tech products Nigeria, buy electronics online Nigeria, power bank, chargers, wireless earbuds Lagos, FIL Store",
  };
}

const Shop = () => {
  return (
    <div>
      <div className="overflow-hidden">
        <TextSlider className="bg-[#fafafa]" />
      </div>
      <ProductList />
    </div>
  );
};

export default Shop;
