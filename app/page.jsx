import React from "react";
import { SOCIAL_URLS } from "@/lib/socials";
import { STORE_CATEGORIES } from "@/lib/categories";
import { SITE_URL, MAGFLEX_PATH, jsonLdHtml } from "@/lib/seo";
import Hero1 from "@/components/landing/Hero1";
import Hero2 from "@/components/landing/Hero2";
import BestSellers from "@/components/landing/BestSellers";
import WhatsAppReviews from "@/components/landing/WhatsAppReviews";
import Anniversary from "@/components/landing/Anniversary";
import Creators from "@/components/landing/Creators";
// import FeaturedBlog from "@/components/landing/FeaturedBlog";
import Marquee from "@/components/landing/Marquee";
import NeedsPower from "@/components/landing/NeedsPower";
// import VideoAnimation from "@/components/landing/VideoAnimation";
import MadeFor from "@/components/landing/MadeFor";
import Banner from "@/components/landing/Banner";
import { getWhatsAppReviews } from "@/lib/whatsappReviews";
import { getFeaturedProducts } from "@/lib/products";

// Rebuilt hourly, and straight away when an admin edits the WhatsApp reviews
export const revalidate = 3600;

export const metadata = {
  title: "Buy Power Banks, Wearables, Chargers & Tech in Nigeria | FIL Store Online",
  description: "Shop original power banks, wireless earbuds, phone chargers & tech accessories online in Nigeria. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Pay on delivery available. Trusted online tech store.",
  keywords: "buy power bank online Nigeria, power bank price in Nigeria, wireless earbuds Nigeria, phone charger Nigeria, buy tech accessories online Nigeria, pay on delivery Nigeria, fast delivery Lagos, original power bank Nigeria",
  openGraph: {
    title: "Buy Power Banks, Wearables, Chargers & Tech in Nigeria | FIL Store Online",
    description: "Shop original power banks, wireless earbuds, phone chargers & tech accessories online in Nigeria. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Pay on delivery available.",
    url: SITE_URL,
    siteName: 'FIL Store',
    images: [
      {
        url: `${SITE_URL}/fillogo.png`,
        width: 1200,
        height: 630,
        alt: 'FIL Store - Tech Products Nigeria',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Buy Power Banks, Wearables, Chargers & Tech in Nigeria | FIL Store Online",
    description: "Shop original power banks, wireless earbuds, phone chargers & tech accessories online in Nigeria. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Pay on delivery available.",
    images: [`${SITE_URL}/fillogo.png`],
  },
  verification: {
    google: "F4YtRJObu3UIQ0aKa9qg3vBcTduL3MxF5mlHoxLyr94",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const page = async () => {
  const [reviewChats, featuredProducts] = await Promise.all([
    getWhatsAppReviews("home"),
    getFeaturedProducts(),
  ]);

  const baseUrl = SITE_URL;

  // 1. The site itself (Google shows this name above results)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FIL Store",
    "alternateName": ["Filstore", "FIL"],
    "url": baseUrl,
  };

  // 2. Organization Schema (Enhanced for Google Recognition)
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "FIL Store",
    "alternateName": "Fedan Investment Limited",
    "url": baseUrl,
    "logo": `${baseUrl}/fillogo.png`,
    "description": "FIL Store is Nigeria's leading online retailer for quality tech products including power banks, smartwatches, phone chargers, and electronic accessories. We deliver authentic products at competitive prices nationwide.",
    "foundingDate": "1994",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+2347018900705",
        "email": "filsmteam@gmail.com",
        "areaServed": "NG",
        "availableLanguage": ["en"]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "20 Fedan St, Ojo, Lagos 102113, Lagos",
      "addressLocality": "Lagos",
      "addressRegion": "Lagos",
      "postalCode": "102113",
      "addressCountry": "NG"
    },
    "sameAs": SOCIAL_URLS,
    "areaServed": [
      {
        "@type": "City",
        "name": "Lagos"
      },
      {
        "@type": "City",
        "name": "Abuja"
      },
      {
        "@type": "City",
        "name": "Port Harcourt"
      }
    ]
  };

  // 3. The main sections, in the order we'd like them as sitelinks under the homepage result
  const navigation = [
    ...STORE_CATEGORIES.map((c) => ({ name: c.title, url: `${baseUrl}/products/${c.slug}` })),
    { name: "FIL MagFlex Power Bank", url: `${baseUrl}${MAGFLEX_PATH}` },
    { name: "Contact Us", url: `${baseUrl}/contact` },
    { name: "Blog", url: `${baseUrl}/blog` },
  ];
  const navigationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": navigation.map((item, i) => ({
      "@type": "SiteNavigationElement",
      "position": i + 1,
      ...item,
    })),
  };

  return (
    <div className="bg-white overflow-x-hidden text-black">
      {[websiteJsonLd, organizationJsonLd, navigationJsonLd].map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(data)} />
      ))}

      <Hero1 />
      <Marquee/>
      <Hero2 />
      <NeedsPower/>
      <BestSellers initialProducts={featuredProducts}/>
      <WhatsAppReviews chats={reviewChats}/>
      {/* <VideoAnimation/> */}
      <MadeFor/>
      <Anniversary/>
      <Creators/>
      {/* <FeaturedBlog/> */}
      <Banner/>
    </div>
  );
};

export default page;