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

const page = () => {
  return (
    <div className="bg-white overflow-x-hidden text-black">
      <Hero />
      <About />
      <ProductCategory />
      <BestSellerSection />
      <VideoSection />
      <FansSection />
      {/* <Moment/> */}
      <FAQ />
      {/* <ImageCarousel /> */}
    </div>
  );
};

export default page;
