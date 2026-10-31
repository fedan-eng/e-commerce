import React from 'react';
import Image from 'next/image';

// Sits between "Made for the whole day" and the creators section
const Anniversary = () => {
  return (
    <section className="w-full bg-white pb-16 md:pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-[#DAF0FF] px-6 py-10 sm:px-10 md:px-14 md:py-16 lg:px-[72px]">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 lg:gap-16">

            {/* Laurel */}
            <div className="relative w-[120px] h-[110px] sm:w-[150px] sm:h-[140px] lg:w-[170px] lg:h-[150px] shrink-0">
              <Image
                src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/30Flower.png"
                alt="30+ years"
                fill
                sizes="170px"
                className="object-contain"
              />
            </div>

            {/* Story */}
            <div className="flex-1 max-w-[520px]">
              <h2 className="text-[22px] sm:text-[32px] lg:text-[36px] leading-[1.1] font-bold text-[#004328] tracking-tight">
                Nigeria’s first phone accessories company.
              </h2>
              <p className="text-[14px] sm:text-[16px] leading-relaxed text-[#004328]/80 mt-3">
                Built on over 30 years of industry experience. Today we make the tools that help
                creators and everyday Nigerians power their story.
              </p>
            </div>

            {/* Stats */}
            <div className="md:ml-auto border-t md:border-t-0 md:border-l border-[#004328]/20 pt-6 md:pt-0 md:pl-10 space-y-4">
              <div>
                <p className="text-[22px] sm:text-[26px] font-bold text-[#004328] leading-tight">30+ years</p>
                <p className="text-[13px] text-[#004328]/75">in the phone accessories industry</p>
              </div>
              <div>
                <p className="text-[22px] sm:text-[26px] font-bold text-[#004328] leading-tight">3 stores</p>
                <p className="text-[13px] text-[#004328]/75">
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
