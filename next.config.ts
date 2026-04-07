import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "cdn.bmstores.co.uk",
      "bigfootdigital.co.uk",
      "t3.ftcdn.net",
      "filstore.com.ng",
      "www.filstore.com.ng",
      "i.ibb.co",
    ],
  },

  // Redirect www to non-www
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.filstore.com.ng",
          },
        ],
        destination: "https://filstore.com.ng/:path*",
        permanent: true, // 301 redirect
      },
    ];
  },

  // Add SEO-friendly headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  // Enable compression
  compress: true,
};

export default nextConfig;