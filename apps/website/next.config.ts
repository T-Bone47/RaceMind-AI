import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@racemind/ui", "@racemind/types"],
};

export default nextConfig;
