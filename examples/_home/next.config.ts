import {EXAMPLES_DIRS, getHomeConfig} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rewrites = [];

    for (const exampleName of Object.values(EXAMPLES_DIRS)) {
      rewrites.push(...getHomeConfig(exampleName));
    }

    return rewrites;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
