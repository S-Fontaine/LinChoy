import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  images: {
    qualities: [50, 75],
    formats: ["image/webp"],
    deviceSizes: [384, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384, 480, 576],
  },
};

export default nextConfig;
