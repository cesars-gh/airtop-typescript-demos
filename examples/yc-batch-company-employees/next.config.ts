import { EXAMPLES_DIRS, registerToHome} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...registerToHome(EXAMPLES_DIRS.YC_BATCH_COMPANY_EMPLOYEES),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
