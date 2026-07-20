import React from "react";
import TextSlider from "@/components/TextSlider";
import ProductList from "../../components/ProductList";

// the static metadata block has been removed because we now build everything inside
// `generateMetadata`. keeping both exports at once triggers a Next.js build error.

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
    const resolvedSearchParams = await searchParams;
  
  const category = resolvedSearchParams.categories;
  const special = resolvedSearchParams.specials;


  
  // Category-specific metadata
  const categoryMetadata = {
    "Power Bank": {
      title: "Power Bank Price in Nigeria | Buy Power Banks Online | FIL Store",
      description: "Buy power bank online Nigeria at best prices. Original power banks 5,000mAh to 60,000mAh. Fast charging, magnetic wireless, solar power bank. Pay on delivery available. Fast delivery in Lagos, Abuja, Port Harcourt.",
      keywords: "power bank price in Nigeria, buy power bank online Nigeria, original power bank Nigeria, power bank for sale in Nigeria, affordable power bank Nigeria, cheap power bank Nigeria, power bank delivery Lagos"
    },
    "Wearables": {
      title: "Wireless Earbuds Nigeria | Buy Earbuds Online | Noise Cancelling | FIL Store",
      description: "Buy wireless earbuds online Nigeria. Noise cancelling earbuds, ANC, Bluetooth earbuds, sports earbuds. Original earbuds at best prices. Pay on delivery available. Earbuds shop in Lagos with fast delivery.",
      keywords: "wireless earbuds Nigeria, buy earbuds online Nigeria, noise cancelling earbuds Nigeria, earbuds price in Nigeria, original earbuds Lagos, best earbuds to buy in Nigeria, affordable earbuds Nigeria, cheap earbuds Nigeria"
    },
    "Chargers": {
      title: "Fast Charging Cable Nigeria | Buy Charger Online | USB-C, Lightning | FIL Store",
      description: "Buy charger online Nigeria. Fast charging cable, USB-C cable, Lightning cable, original charger Nigeria. iPhone & Android compatible. 3-in-1 cable, type-c cable. Pay on delivery available. Charger delivery Lagos.",
      keywords: "fast charging cable Nigeria, buy charger online Nigeria, original charger Nigeria, USB-C cable price in Nigeria, Lightning cable price in Nigeria, cheap charger Nigeria, charger under ₦10,000 Nigeria"
    },
    "Lifestyle": {
      title: "Smart Projector Nigeria | Solar Rechargeable Bulb for Sale | Tech Lifestyle | FIL Store",
      description: "Buy smart projector online Nigeria at best prices. Solar rechargeable bulb for sale in Nigeria, rechargeable bulb price in Nigeria. Tech lifestyle gadgets, smart home devices. Pay on delivery available. Fast delivery nationwide.",
      keywords: "smart projector Nigeria, solar rechargeable bulb Nigeria, rechargeable bulb for sale in Nigeria, rechargeable bulb price in Nigeria, best deal on smart projector Nigeria, buy tech gadgets online Nigeria"
    },
    "Extensions": {
      title: "Extension Cable Nigeria | Power Strip & Surge Protector | Buy Extension Online | FIL Store",
      description: "Buy extension cable online Nigeria. Power strip, surge protector, multi socket extension with USB ports. Wireless charging extensions. Protect devices from power surges. Pay on delivery available. Extension delivery Lagos.",
      keywords: "extension cable Nigeria, buy extension online Nigeria, power strip Lagos, surge protector Nigeria, multi socket Nigeria, USB extension, cheap extension Nigeria"
    }
  };

  // Special/Filter pages metadata
  const specialMetadata = {
    isBestseller: {
      title: "Best Tech Products to Buy in Nigeria | Top Selling Power Banks, Earbuds | FIL Store",
      description: "Shop best tech products to buy in Nigeria. Top selling power banks, wireless earbuds, chargers. Customer favorites with proven quality. Pay on delivery available. Fast delivery in Lagos, Abuja. Trusted online tech store Nigeria.",
      keywords: "best tech products to buy in Nigeria, top selling products Nigeria, best power bank to buy in Nigeria, best earbuds to buy in Nigeria, popular gadgets Nigeria, trusted online tech store Nigeria"
    },
    isWhatsNew: {
      title: "New Tech Products Nigeria 2026 | Latest Power Banks, Earbuds | FIL Store",
      description: "Discover new tech products in Nigeria 2026. Latest power banks, wireless earbuds, chargers just arrived. Best deal on smart projector Nigeria. Pay on delivery available. Fast delivery nationwide. Shop new arrivals now.",
      keywords: "new tech products Nigeria 2026, latest power banks Nigeria, new earbuds Nigeria, new arrivals Nigeria, latest gadgets Lagos, best deal on smart projector Nigeria"
    },
    isTodaysDeal: {
      title: "Tech Deals Nigeria | Cheapest Power Banks, Earbuds Discount | Flash Sale | FIL Store",
      description: "Grab tech deals in Nigeria. Cheapest power banks, earbuds discount, charger under ₦10,000 Nigeria. Flash sale Lagos, special offers. Rechargeable bulb discount Nigeria. Pay on delivery available. Don't miss out!",
      keywords: "tech deals Nigeria, cheapest power bank in Nigeria, earbuds discount Nigeria, charger under ₦10,000 Nigeria, flash sale Lagos, rechargeable bulb discount Nigeria, special offers tech Nigeria"
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
    title: "Shop Tech Accessories Online Nigeria | Power Banks, Earbuds, Chargers | Pay on Delivery",
    description: "Shop tech accessories online Nigeria with pay on delivery. Power banks, wireless earbuds, phone chargers, cables, extensions. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Original products, trusted online tech store Nigeria.",
    keywords: "shop tech accessories online Nigeria, buy electronics online Nigeria pay on delivery, power bank Nigeria, wireless earbuds Nigeria, phone charger Nigeria, online tech store Nigeria fast delivery, secure online shopping Nigeria",
  };
}

export default async function Shop() {
  return (
    <div>
      <div className="overflow-hidden">
        <TextSlider className="bg-[#fafafa]" />
      </div>
      <ProductList/>
    </div>
  );
}
