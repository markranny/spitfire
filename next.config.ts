import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    if (!isServer) {
      config.externals = {
        ...config.externals,
        canvg: "canvg",
      };
    }
    return config;
  },
};

export default nextConfig;
