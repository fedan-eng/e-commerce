import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "cdn.bmstores.co.uk",
      "bigfootdigital.co.uk",
      "t3.ftcdn.net",
    ], // Add any other external domains here
  },
};

export default nextConfig;
