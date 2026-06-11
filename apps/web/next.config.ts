import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@eventrack/ui",
    "@eventrack/shared",
    "@eventrack/auth",
    "@eventrack/database",
  ],
};

export default nextConfig;
