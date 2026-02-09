import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/personas-de-confianza',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
