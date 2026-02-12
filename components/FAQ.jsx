"use client";

import Accordion from "@/components/Accordion";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import Link from "next/link";

const data = [
  {
    title: "What payment methods do you accept?",
    content:
      "We accept various payment options, including credit/debit cards (Visa, Mastercard, etc.), bank transfers, USSD, with Paystack.",
  },
  {
    title: "How long does shipping take, and what are the delivery charges?",
    content:
      "Shipping times vary based on your location, but most orders are delivered within 3-7 business days. Delivery charges depend on the shipping method and destination, with free shipping available on Thursdays.",
  },
  {
    title: "What is our return and refund policy?",
    content:
      "We offer a 7-day return policy for defective or unused products. To initiate a retum, contact our support team with your order details. Refunds are processe within 5 business days after we receive the returned item.",
  },
  {
    title: "Are your gadgets covered by a warranty?",
    content:
      "Yes, most of our products come with a manufacturer's warranty ranging from 6 months to 2 years, depending on the item. Check the product description for warranty details, and contact us if you need assistance with a claim.",
  },
  {
    title: "How do I know if a product is compatible with my device?",
    content:
      "Yes, most of our products come with a manufacturer's warranty ranging from 6 months to 2 years, depending on the item. Check the product description for warranty details, and contact us if you need assistance with a claim.",
  },
];

const FAQ = () => {
  return (
    <div className="md:flex justify-between items-center gap-4 cat:gap-10 bg-[#fafafa] px-4 md:px-10 xl:px-[150px] py-12">
      <div>
        <h1 className="mb-9 font-oswald font-medium text-[32px] md:text-[40px]">
          Frequently Asked <br />{" "}
          <span className="text-filgreen">Questions</span>
        </h1>

        <div className="bg-bright p-6 rounded-md">
          <h2 className="mb-2 font-oswald text-[32px]">
            Still have questions?
          </h2>
          <p className="mb-8 text-[#3e3e3e] text-sm">
            Can't find answers to your questions? Send us an email and we'll get
            back to you as soon as possible.
          </p>

          <Link
            href="/contact"
            className="shadow-button buttons"
          >
            Send Email
          </Link>
        </div>
      </div>

      <div className="w-full">
        <Accordion
          items={data}
          className="mx-auto"
          headerClassName={(isOpen) =>
            `font-medium text-xs sm:text-sm text-left bg-[#efefef] p-4 ${
              isOpen ? "my-0 " : "rounded-md my-3"
            }  `
          }
          contentClassName=" bg-[#efefef] px-4 -py-4 pb-4 text-sm text-[#3e3e3e]  "
          icon={({ isOpen }) => (isOpen ? <FaMinus /> : <FaPlus />)}
          iconClassName=" bg-filgreen p-3 rounded-md shadow-button ml-2"
        />
      </div>
    </div>
  );
};

export default FAQ;
