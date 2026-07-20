import React from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import ProductCategory from "../components/ProductCategory";
import BestSellerSection from "../components/BestSellerSection";
import VideoSection from "../components/VideoSection";
import FAQ from "./../components/FAQ";

export const metadata = {
  title: "Buy Power Banks, Wearables, Chargers & Tech in Nigeria | FIL Store Online",
  description: "Shop original power banks, wireless earbuds, phone chargers & tech accessories online in Nigeria. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Pay on delivery available. Trusted online tech store.",
  keywords: "buy power bank online Nigeria, power bank price in Nigeria, wireless earbuds Nigeria, phone charger Nigeria, buy tech accessories online Nigeria, pay on delivery Nigeria, fast delivery Lagos, original power bank Nigeria",
  metadataBase: new URL('https://www.filstore.com.ng'),
  openGraph: {
    title: "Buy Power Banks, Wearables, Chargers & Tech in Nigeria | FIL Store Online",
    description: "Shop original power banks, wireless earbuds, phone chargers & tech accessories online in Nigeria. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Pay on delivery available.",
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
    title: "Buy Power Banks, Wearables, Chargers & Tech in Nigeria | FIL Store Online",
    description: "Shop original power banks, wireless earbuds, phone chargers & tech accessories online in Nigeria. Best prices, fast delivery in Lagos, Abuja, Port Harcourt. Pay on delivery available.",
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

  // 2. Organization Schema (Enhanced for Google Recognition)
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
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
    "sameAs": [
  "https://www.instagram.com/filstoreng?utm_source=ig_web_button_share_sheet&igsh=NTRkZHUxaXYzYnRz",
  "https://www.tiktok.com/@filstoreng_",
],
    "priceRange": "$",
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteLinksJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      
      {/* Organization Info */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      
      {/* Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
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