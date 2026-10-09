import React from 'react';

const moments = [
  {
    id: 1,
    time: '6:40am',
    dotColor: 'bg-[#C49BFF]', // Purple
    imageBg: 'bg-[#F2EBFF]',
    title: 'Earbuds in, noise out.',
    product: 'FIL Pods Pro',
    // Using a lifestyle/product mix that works well with the blend mode
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    // Staggered layout classes for tablet and desktop
    marginClasses: 'md:mt-0 lg:mt-0',
  },
  {
    id: 2,
    time: '1:15pm',
    dotColor: 'bg-[#00E575]', // Green
    imageBg: 'bg-[#E5FDF0]',
    title: '9% battery. Not a problem.',
    product: 'FIL Thunder 30K',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
    marginClasses: 'md:mt-[60px] lg:mt-[80px]',
  },
  {
    id: 3,
    time: '4:30pm',
    dotColor: 'bg-[#7BC5FF]', // Blue
    imageBg: 'bg-[#EBF5FF]',
    title: 'Light is not. Fan is on.',
    product: 'FIL Flex Fan',
    image: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&w=600&q=80',
    marginClasses: 'md:mt-0 lg:mt-[30px]',
  },
  {
    id: 4,
    time: '11:50pm',
    dotColor: 'bg-[#FFD166]', // Yellow
    imageBg: 'bg-[#FFF9E5]',
    title: 'Long call, still charging strong.',
    product: 'FIL MagFlex 10K',
    image: 'https://images.unsplash.com/photo-1662947995689-ec8a85ba4e68?auto=format&fit=crop&w=600&q=80',
    marginClasses: 'md:mt-[60px] lg:mt-[110px]',
  },
];

const MadeFor = () => {
  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight mb-2">
            Made for the whole day.
          </h2>
          <p className="text-gray-500 text-[15px] sm:text-base">
            From the first bus to the last call, here's where FIL shows up.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
          {moments.map((moment) => (
            <div
              key={moment.id}
              className={`flex flex-col group ${moment.marginClasses}`}
            >
              {/* Time Indicator */}
              <div className="flex items-center gap-2.5 mb-3.5 px-1">
                <span className={`w-2 h-2 rounded-full ${moment.dotColor}`} />
                <span className="text-[#0A321B] font-bold text-[14px] sm:text-[15px]">
                  {moment.time}
                </span>
              </div>

              {/* Image Card */}
              <div
                className={`relative w-full aspect-[4/5] rounded-[32px] overflow-hidden mb-4 ${moment.imageBg} flex items-center justify-center p-4`}
              >
                {/* 
                  mix-blend-multiply makes the white backgrounds of the 
                  unsplash placeholders vanish into the colored card background 
                */}
                <img
                  src={moment.image}
                  alt={moment.title}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text & Product Pill */}
              <div className="px-1 flex flex-col items-start">
                <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-3">
                  {moment.title}
                </h3>
                
                {/* Pill */}
                <div className="inline-flex items-center gap-2 px-1.5 py-1.5 bg-[#F4F5F4] rounded-full">
                  <div className={`w-[22px] h-[22px] rounded-full ${moment.dotColor} flex-shrink-0 shadow-sm`} />
                  <span className="text-[12px] font-bold text-[#0A321B] pr-3">
                    {moment.product}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MadeFor;