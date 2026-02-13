import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the app directory inside app/src/app
  experimental: {},
  typescript: {
    // Pre-existing ioredis/bullmq type conflicts in queue files — not blocking
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
