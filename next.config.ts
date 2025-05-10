import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    if (config.optimization) {
      // disable any minimization on the Webpack side
      config.optimization.minimize = false;
      // remove any minimizer plugins (e.g. MinifyWebpackPlugin)
      if (Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer.length = 0;
      }
    }
    return config;
  },
};

export default nextConfig;
