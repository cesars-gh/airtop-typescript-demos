import { exampleListings, getHomeConfig } from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rewrites = [];

    for (const exampleName of Object.values(exampleListings.YC_BATCH_COMPANY_EMPLOYEES.dirName)) {
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
