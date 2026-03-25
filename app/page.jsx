import React from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import ProductCategory from "../components/ProductCategory";
import BestSellerSection from "../components/BestSellerSection";
import VideoSection from "../components/VideoSection";
import FAQ from "./../components/FAQ";

export const metadata = {
  title: "FIL Store - Buy Power Banks, Wearables, Chargers & Tech Accessories in Nigeria",
  description: "Shop quality tech products at unbeatable prices in Nigeria. Power banks, smartwatches, phone chargers, cables, and lifestyle accessories. Fast delivery in Lagos, Abuja, Port Harcourt. Authentic products, best prices. Think quality, think FIL.",
  keywords: "FIL Store, buy tech products Nigeria, power bank Lagos, smartwatch Nigeria, phone charger, tech accessories, electronics store Nigeria",
  metadataBase: new URL('https://www.filstore.com.ng'),
  openGraph: {
    title: "FIL Store - Quality Tech Products in Nigeria",
    description: "Power banks, wearables, chargers & accessories at unbeatable prices. Fast delivery nationwide.",
    url: 'https://www.filstore.com.ng',
    siteName: 'FIL Store',
    images: [
      {
        url: 'https://www.filstore.com.ng/fillogo.png',
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
    title: "FIL Store - Quality Tech Products in Nigeria",
    description: "Shop power banks, wearables, chargers & tech accessories. Fast delivery nationwide.",
    images: ['https://www.filstore.com.ng/fillogo.png'],
  },
  verification: {
    google: "F4YtRJObu3UIQ0aKa9qg3vBcTduL3MxF5mlHoxLyr94",
  },
  alternates: {
    canonical: 'https://www.filstore.com.ng',
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

const page = () => {
  const baseUrl = "https://www.filstore.com.ng";

  // 1. Homepage & Searchbox Schema (The "Konga" Look)
  const siteLinksJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FIL Store",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 2. Organization Schema
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "FIL Store",
    "url": baseUrl,
    "logo": `${baseUrl}/fillogo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+234-YOUR-PHONE", // Replace with actual phone
      "contactType": "customer service",
      "areaServed": "NG",
      "availableLanguage": "en"
    },
    "sameAs": [
      "https://www.instagram.com/filstore", // Replace with actual social links
      "https://www.facebook.com/filstore"
    ]
  };

  // 3. Breadcrumb List
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "All Products",
        "item": `${baseUrl}/products`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Power Banks",
        "item": `${baseUrl}/products?categories=Power+Bank`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Wearables",
        "item": `${baseUrl}/products?categories=Wearables`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Chargers & Cables",
        "item": `${baseUrl}/products?categories=Chargers`
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "Contact Us",
        "item": `${baseUrl}/contact`
      }
    ]
  };

  return (
    <div className="bg-white overflow-x-hidden text-black">
      {/* Sitelinks Searchbox & WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLinksJsonLd) }}
      />
      
      {/* Organization Info */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      
      {/* Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Hero />
      <About />
      <ProductCategory />
      <BestSellerSection />
      <VideoSection />
      <FAQ />
    </div>
  );
};

export default page;