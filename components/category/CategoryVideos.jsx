"use client";
// components/category/CategoryVideos.jsx — "See it up Close."
import { useState } from "react";

export default function CategoryVideos({ category, products }) {
  // Some products have empty strings in `videos` — drop them
  const withVideos = products
    .map((p) => ({ ...p, videos: (p.videos || []).filter(Boolean) }))
    .filter((p) => p.videos.length);
  const [activeId, setActiveId] = useState(withVideos[0]?._id);
  const active = withVideos.find((p) => p._id === activeId) || withVideos[0];

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-16">
      {/* TODO: design */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">See it up Close.</h2>
          <p className="mt-2 text-sm text-gray-600">
            Real products on real video, so you know exactly what you&apos;re getting.
          </p>
        </div>
        {withVideos.length > 1 && (
          <div className="flex gap-2">
            {withVideos.map((p) => (
              <button
                key={p._id}
                onClick={() => setActiveId(p._id)}
                className={`rounded-full px-4 py-2 text-xs ${p._id === active?._id ? "bg-[#004328] text-white" : ""}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="mt-6 aspect-video w-full overflow-hidden rounded-3xl"
        style={{ backgroundColor: category.accent }}
      >
        {active ? (
          <video
            key={active._id}
            src={active.videos[0]}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Video coming soon
          </div>
        )}
      </div>
    </section>
  );
}
