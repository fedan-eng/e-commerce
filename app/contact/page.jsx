"use client";
import React, { useState } from "react";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import TextSlider from "@/components/TextSlider";
import Tracking from "@/components/Tracking";
import Loading from "@/components/Loading";
import Image from "next/image";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="overflow-hidden">
        <TextSlider className="bg-[#fafafa]" />
      </div>

      <div className="mx-auto px-2 pb-20 rounded-md w-full max-w-[1140px]">
        <Tracking />
        <ContactForm />
        <div className="flex max-nav:justify-center items-center gap-2">
          <div className="w-full nav:min-w-[400px] max-w-[600px]">
            <h2 className="mb-6 font-oswald font-medium text-2xl xxs:text-4xl">
              Get 10% Off Your First Order
            </h2>

            <div>
              <h3 className="mb-3 font-medium">Steps to saving:</h3>
              <div className="flex gap-2">
                {" "}
                <Image
                  height={24}
                  width={24}
                  src="/tick.png"
                  alt="tick"
                  className="w-6 h-6"
                />
                <p> Sign up and gain exclusive access to emails from us</p>
              </div>

              <div className="flex gap-2 mt-3">
                {" "}
                <Image
                  height={24}
                  width={24}
                  src="/tick.png"
                  alt="tick"
                  className="w-6 h-6"
                />
                <p> Receive an email with your 20% discount code</p>
              </div>

              <div className="flex items-end gap-2 md:gap-4 rounded-md w-full">
                <div className="mt-6 w-full max-w-[600px] nav:max-w-[339px]">
                  <input
                    type="text"
                    name="track"
                    id="track"
                    placeholder="Order number"
                    //value={orderId}
                    //onChange={(e) => setOrderId(e.target.value)}
                    className="bg-[#f7f7f7] p-4 rounded-md outline-0 w-full placeholder-text-[#3e3e3e] text-sm"
                  />
                </div>

                <button
                  className={
                    loading
                      ? ""
                      : " block bg-filgreen whitespace-nowrap px-3 sm:px-6 py-4 rounded-md text-dark font-medium text-sm shadow-button  "
                  }
                >
                  {loading ? <Loading /> : "Get started"}
                </button>
              </div>
            </div>
          </div>

          <div className="max-nav:hidden border-[6px] border-black rounded-md w-full max-w-[561px]">
            <div className="w-full max-w-[561px] h-[268px]">
              <img
                className="w-full h-full object-contain"
                src="/tag.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <FAQ />
    </div>
  );
};

export default ContactPage;
