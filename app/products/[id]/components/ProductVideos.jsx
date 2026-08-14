"use client";

import { useState } from "react";
import Image from "next/image";

function ProductVideos({ videos }) {
  const [activeVideo, setActiveVideo] = useState(null);

  if (!videos?.length > 0) return null;

  return (
    <div className="self-start mt-[38px] w-full">
      <h3 className="mx-2 font-oswald font-medium text-2xl">
        Product Live Cam
      </h3>
      <div className="flex gap-2 md:gap-4 mx-2 my-4">
        {videos.map((video, index) => (
          <div key={index} className="relative w-full">
            {activeVideo === index ? (
              <video
                src={video}
                controls
                autoPlay
                className="shadow rounded-md w-full"
              />
            ) : (
              <div
                onClick={() => setActiveVideo(index)}
                className="group relative cursor-pointer"
              >
                <video
                  src={video}
                  className="opacity-70 group-hover:opacity-100 rounded-lg w-full"
                  muted
                />
                <div className="absolute">
                  <Image src="/play.svg" alt="play" width={50} height={50} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductVideos;