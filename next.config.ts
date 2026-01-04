import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/strapi/:path*',
        destination: 'https://realistic-hope-d6c1c5274b.strapiapp.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
