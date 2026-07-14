import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.bmstores.co.uk",
      },
      {
        protocol: "https",
        hostname: "bigfootdigital.co.uk",
      },
      {
        protocol: "https",
        hostname: "t3.ftcdn.net",
      },
      {
        protocol: "https",
        hostname: "filstore.com.ng",
      },
        {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "www.filstore.com.ng",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
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