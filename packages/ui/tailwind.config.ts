import { tailwindConfig } from "@local/tailwind-config";
import type { Config } from "tailwindcss";

export default {
  ...tailwindConfig,
  content: ["components/**/*.{ts,tsx}"],
} satisfies Config;
