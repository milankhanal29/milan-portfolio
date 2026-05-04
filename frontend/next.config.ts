import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "milan-portfolio-api.up.railway.app",
      },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/v1/:path*",
          destination: "https://milan-portfolio-api.up.railway.app/api/v1/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
