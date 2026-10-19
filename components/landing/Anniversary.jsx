import React from 'react';
import Image from 'next/image';

// Sits right under Hero2 — the badge overlaps Hero2's bottom edge, so this section stacks above it.
const Anniversary = () => {
  return (
    <section className="relative z-10 w-full bg-white pt-10 sm:pt-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] bg-[#D4FBE4] px-6 py-10 sm:px-10 md:px-14 md:py-14">

          {/* Badge breaking out of the top-left corner */}
          <div className="absolute -top-[52px] -left-1 w-[80px] h-[80px] sm:-top-[64px] sm:-left-[34px] sm:w-[104px] sm:h-[104px] drop-shadow-lg">
            <Image
              src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/30Badge.png"
              alt="30+ years of industry experience"
              fill
              sizes="104px"
              className="object-contain"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">

            {/* Laurel */}
            <div className="relative w-[120px] h-[110px] sm:w-[140px] sm:h-[130px] shrink-0">
              <Image
                src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/30Flower.png"
                alt="30+ years"
                fill
                sizes="140px"
                className="object-contain"
              />
            </div>

            {/* Story */}
            <div className="flex-1 max-w-[420px]">
              <h2 className="text-[26px] sm:text-[32px] leading-[1.15] font-bold text-[#004328] tracking-tight">
                Nigeria’s first phone accessories company.
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#004328]/80 mt-3">
                Built on over 30 years of industry experience. Today we make the tools that help
                creators and everyday Nigerians power their story.
              </p>
            </div>

            {/* Stats */}
            <div className="md:ml-auto border-t md:border-t-0 md:border-l border-[#004328]/20 pt-6 md:pt-0 md:pl-8 space-y-4">
              <div>
                <p className="text-[20px] sm:text-[22px] font-bold text-[#004328] leading-tight">30+ years</p>
                <p className="text-[12px] text-[#004328]/70">in the phone accessories industry</p>
              </div>
              <div>
                <p className="text-[20px] sm:text-[22px] font-bold text-[#004328] leading-tight">3 stores</p>
                <p className="text-[12px] text-[#004328]/70">
                  Ikeja, Alaba and Awka.{' '}
                  {/* TODO: link to the stores page once it exists */}
                  <a className="font-semibold text-[#004328] underline underline-offset-2 cursor-pointer">Visit us</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Anniversary;
