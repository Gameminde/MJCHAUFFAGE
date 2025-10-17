import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Explicitly set Turbopack workspace root to this app to silence warnings
    root: __dirname,
  },
};

export default nextConfig;
