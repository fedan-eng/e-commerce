import TextSlider from "@/components/TextSlider";


const steps = [
  {
    topic: "✔  Explore Our Latest Products",
    desc: "Browse our high-quality offerings designed just for you.",
  },

  {
    topic: "✔  Exclusive Promos & Discounts",
    desc: "Be the first to know about special deals and limited-time offers.",
  },
  {
    topic: "✔  Easy Ordering",
    desc: "Place orders seamlessly and track them in real time. ",
  },
  {
    topic: "✔  Wishlist Your Favorites",
    desc: "Save products you love for later and never miss out.",
  },

  {
    topic: "✔  Personalized Updates ",
    desc: "Get tailored recommendations based on your preferences.",
  },
];

const Welcome = () => {
  return (
    <div className="">
      <TextSlider />

      <div className="flex justify-center">

        
        <div className="bg-[#f6f6f6] mb-38 px-2 sm:px-5 md:px-10 lg:px-52 pt-6 pb-8 rounded-md w-full max-w-[1140px] text-center">
        
          <h2 className="mb-1 font-oswald font-medium text-[40px]">
            Hello Daniel
          </h2>

          <h2 className="mb-7 font-oswald font-medium text-[40px]">
            Welcome to FIL -
            <span className="text-filgreen"> THINK QUALITY, THINK FIL</span>
          </h2>

          <p className="mb-8 text-sm">
            {" "}
            Thank you for joining the FIL community! We're thrilled to have you
            on board and can't wait to help you discover our latest products,
            exclusive promotions, and exceptional service.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <button className="hover:bg-mustard px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-filgreen text-xs xs:text-sm">
              Go to Home Page
            </button>

            <button className="shadow-button buttons">View Profile</button>
          </div>

          <div>
            <h2 className="mb-6 font-oswald font-medium text-2xl">
              What's next?
            </h2>

            <div className="mb-6">
              {steps.map((step, index) => (
                <p
                  className="font-medium text-sm"
                  key={index}
                >
                  
                  {step.topic}
                  {" "}{"-"}{" "}
                  <span className="font-normal"> {step.desc} </span>
                </p>
              ))}
            </div>

            <p className="mb-6 font-normal text-sm">
              Your account is now active, and you're all set to enjoy a seamless
              shopping experience with FIL
            </p>

            <p className="mb-9 font-normal text-sm">
              If you have any questions or need assistance, feel free to reach
              out to our support team at [Support Email] or [Support Phone
              Number].
            </p>

            <p className="text-sm">Happy shopping!</p>
          </div>
        
      </div>
      </div>
    </div>
  );
};

export default Welcome;
