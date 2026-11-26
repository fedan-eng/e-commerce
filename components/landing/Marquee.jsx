// components/landing/Marquee.jsx — the four promises under the hero, sliding past endlessly.
// The track holds the items twice and moves left by half its width, so the loop is seamless.
// Pauses on hover; with "reduce motion" on, it slows right down (styles/globals.css).
import React from 'react';
import { Truck, CalendarDays, Headset, Award } from 'lucide-react';

const marqueeItems = [
  { title: 'Free Shipping', subtitle: 'Fast and reliable delivery', icon: Truck },
  { title: '7 Days Return', subtitle: 'Consumer protection program', icon: CalendarDays },
  { title: '24/7 Support', subtitle: 'If you have any questions', icon: Headset },
  { title: 'Best Quality', subtitle: 'Many years on the market', icon: Award },
];

// Each copy repeats the four items twice, so it's wider than big screens and never shows a gap
const ROW = [...marqueeItems, ...marqueeItems];

const Marquee = () => {
  return (
    <section className="group w-full overflow-hidden border-b border-black/5 bg-[#a8edc8] py-4 md:py-5">
      <div className="feature-marquee-track flex w-max group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
            {ROW.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={`${item.title}-${i}`} className="flex shrink-0 items-center gap-3 border-r border-black/10 px-8 md:px-12">
                  <Icon className="h-6 w-6 shrink-0 text-gray-900 md:h-7 md:w-7" strokeWidth={1.8} aria-hidden />
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-[14px] font-bold leading-tight tracking-tight text-gray-900 md:text-[15px]">{item.title}</span>
                    <span className="mt-0.5 text-[11px] font-medium leading-tight text-gray-700/80 md:text-[12px]">{item.subtitle}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </section>
  );
};

export default Marquee;
