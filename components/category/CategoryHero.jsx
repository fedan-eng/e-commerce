// components/category/CategoryHero.jsx
import Image from "next/image";

export default function CategoryHero({ category }) {
  return (
    <section className="relative overflow-hidden">
      {/* TODO: design */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-12 md:px-16">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold md:text-5xl">{category.title}</h1>
          <p className="mt-4 text-gray-600">{category.heroText}</p>
        </div>
        <div className="relative hidden h-[320px] w-[520px] md:block">
          <Image src={category.heroImage} alt={category.title} fill className="object-contain" priority />
        </div>
      </div>
    </section>
  );
}
