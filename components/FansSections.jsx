"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

const reviews = [
  {
    name: "Chioma Okafor",
    init: "/face1.png",
    rating: "5.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Volt Cube",
    topic: "Best power bank I've ever owned!",
    comment:
      "The 40,000mAh capacity is insane! I charged my phone 8 times before it ran out. Fast charging works perfectly and it's surprisingly compact for the power it holds.",
  },
  {
    name: "Tunde Bakare",
    init: "/face2.png",
    rating: "4.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Turbo Charger (3 pins)",
    topic: "Perfect for my family's charging needs",
    comment:
      "With 4 USB ports, everyone can charge at once. No more fighting over outlets! The 4.1A output is fast enough for all our devices. Would give 5 stars if it came with a longer cable.",
  },
  {
    name: "Aisha Mohammed",
    init: "/face3.png",
    rating: "5.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Triple Action 3-in-1 Cable",
    topic: "This cable is a lifesaver",
    comment:
      "I can't believe I lived without this! Lightning, Type-C, and Micro USB all in one. Perfect for traveling and I don't have to carry multiple cables anymore. Super durable too!",
  },
  {
    name: "Emeka Nwosu",
    init: "/face4.png",
    rating: "4.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Bolt Pro",
    topic: "Solar panel is a game changer",
    comment:
      "The 32,500mAh capacity lasts forever, and the solar panel means I can recharge it anywhere there's sunlight. Great for outdoor trips and power outages. Only wish the solar charging was a bit faster.",
  },
  {
    name: "Grace Adeyemi",
    init: "/face1.png",
    rating: "5.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Extension Box Mini",
    topic: "Wireless charging is so convenient!",
    comment:
      "I love that I can just place my phone on top to charge wirelessly while using the outlets for other devices. Smart design and perfect for my bedside table. Worth every naira!",
  },
  {
    name: "Ibrahim Yusuf",
    init: "/face2.png",
    rating: "3.0 Rating",
    productImg: "/pow.webp",
    productName: "LC6 2-meter Cable Android",
    topic: "Good cable but could be better",
    comment:
      "The 2-meter length is great for charging from a distance, and it's tangle-free as advertised. However, the data transfer speed isn't as fast as I expected for the price. Still decent overall.",
  },
  {
    name: "Blessing Eze",
    init: "/face3.png",
    rating: "5.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Flex-Fan",
    topic: "24 hours of cooling bliss!",
    comment:
      "This fan is incredible! The 7,000mAh battery really does last almost a whole day on medium speed. Perfect for Lagos heat and power cuts. Quiet, powerful, and portable. Highly recommend!",
  },
  {
    name: "Oluwaseun Adeleke",
    init: "/face4.png",
    rating: "4.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Multi-Cord Hybrid",
    topic: "Sleek and powerful combination",
    comment:
      "Love the 30,000mAh capacity and the built-in cables are super convenient. The design is really sleek and modern. Only downside is it's a bit heavy to carry in a small bag, but that's expected with this capacity.",
  },
  {
    name: "Ngozi Okoro",
    init: "/face1.png",
    rating: "5.0 Rating",
    productImg: "/pow.webp",
    productName: "FIL Guard FT02",
    topic: "Surge protection + phone holder = genius!",
    comment:
      "This is exactly what I needed for my workspace. The surge protector keeps my devices safe and the integrated phone holder keeps my phone at eye level while charging. Smart design and excellent quality!",
  },
];

const FansSection = () => {
  return (
    <section className="mt-12 mb-20">
      <div className="flex justify-between">
        <Header
          header="FIL Fans Have Spoken"
          imageClassName=" scale-x-[-1]"
          className="justify-end mb-5"
        />
      </div>

      <div className="relative flex reviews">
        <div className="flex reviews-slide">
          {reviews.map((review, index) => (
            // PRODUCT CARDS
            <div
              className="relative flex flex-col justify-between mx-2 pt-4 border border-[#e5e5e5] rounded-md w-[250px] md:w-[370px]"
              key={index}
            >
              <div className="flex items-center gap-3 pr-4 pl-6">
                <div className="flex justify-center items-center bg-moss rounded-full w-[70px] h-[70px] text-white">
                  <img
                    className="rounded-full w-[70px] h-[70px] object-cover"
                    src={review.init}
                  />
                </div>

                <div>
                  <p className="mb-2 font-medium text-sm">{review.name}</p>

                  <div className="flex items-center">
                    <img src="/star.png" />
                    <p className="text-[#3e3e3e] text-xs">{review.rating}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 mb-4 pr-4 pl-6">
                <p className="mb-2 font-medium text-sm"> {review.topic} </p>
                <p className="font-light text-sm text-wrap">{review.comment}</p>
              </div>

              <div className="flex items-center gap-4 py-4 border-[#e5e5e5] border-t">
                <div className="">
                  <Image
                    width={52}
                    height={52}
                    src={review.productImg}
                    alt={review.productName}
                  />
                </div>

                <div className="">
                  <p className="mb-[10px] text-xs">{review.productName}</p>

                  <a
                    className="text-[#007c42] underline text-xs"
                    href="/"
                  >
                    See More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex reviews-slide">
          {reviews.map((review, index) => (
            // PRODUCT CARDS
            <div
              className="relative flex flex-col justify-between mx-2 pt-4 border border-[#e5e5e5] rounded-md w-[250px] md:w-[370px]"
              key={index}
            >
              <div className="flex items-center gap-3 pr-4 pl-6">
                <div className="flex justify-center items-center bg-moss rounded-full w-[70px] h-[70px] text-white">
                  <img
                    className="rounded-full w-[70px] h-[70px] object-cover"
                    src={review.init}
                  />
                </div>

                <div>
                  <p className="mb-2 font-medium text-sm">{review.name}</p>

                  <div className="flex items-center">
                    <img src="/star.png" />
                    <p className="text-[#3e3e3e] text-xs">{review.rating}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 mb-4 pr-4 pl-6">
                <p className="mb-2 font-medium text-sm"> {review.topic} </p>
                <p className="font-light text-sm text-wrap">{review.comment}</p>
              </div>

              <div className="flex items-center gap-4 py-4 border-[#e5e5e5] border-t">
                <div className="">
                  <Image
                    width={52}
                    height={52}
                    src={review.productImg}
                    alt={review.productName}
                  />
                </div>

                <div className="">
                  <p className="mb-[10px] text-xs">{review.productName}</p>

                  <a
                    className="text-[#007c42] underline text-xs"
                    href="/"
                  >
                    See More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FansSection;
