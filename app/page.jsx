import React from "react";

import Hero from "../components/Hero";
import About from "../components/About";
import ProductCategory from "../components/ProductCategory";
import BestSellerSection from "../components/BestSellerSection";
import VideoSection from "../components/VideoSection";
import Moment from "../components/Moment";
import { ImageCarousel } from "./../components/ImageCarousel";
import FAQ from "./../components/FAQ";
import FansSection from "./../components/FansSections";


export const homepageMetadata = {
  title: "FIL Store - Buy Power Banks, Wearables, Chargers & Tech Accessories in Nigeria",
  description: "Shop quality tech products at unbeatable prices in Nigeria. Power banks, smartwatches, phone chargers, cables, and lifestyle accessories. Fast delivery in Lagos, Abuja, Port Harcourt. Authentic products, best prices. Think quality, think FIL.",
  keywords: "FIL Store, buy tech products Nigeria, power bank Lagos, smartwatch Nigeria, phone charger, tech accessories, electronics store Nigeria",
  
  openGraph: {
    title: "FIL Store - Quality Tech Products in Nigeria",
    description: "Power banks, wearables, chargers & accessories at unbeatable prices. Fast delivery nationwide.",
    url: 'https://www.filstore.com.ng',
    siteName: 'FIL Store',
    images: [
      {
        url: '/og-home.jpg',
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
    images: ['/og-home.jpg'],
  },

  verification: {
    google: "F4YtRJObu3UIQ0aKa9qg3vBcTduL3MxF5mlHoxLyr94",
  },

  alternates: {
    canonical: 'https://www.filstore.com.ng',
  },
};

const page = () => {
  return (
    <div className="bg-white overflow-x-hidden text-black">
      <Hero />
      <About />
      <ProductCategory />
      <BestSellerSection />
      <VideoSection />
      {/* <FansSection /> */}
      {/* <Moment/> */}
      <FAQ />
      {/* <ImageCarousel /> */}
    </div>
  );
};

export default page;
