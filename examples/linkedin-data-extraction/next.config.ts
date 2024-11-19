import { EXAMPLES_DIRS, registerToHome} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...registerToHome(EXAMPLES_DIRS.LINKEDIN_DATA_EXTRACTION),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
