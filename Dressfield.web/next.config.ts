import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    // Fabric.js bundles a native Node canvas binary for SSR — we don't need it
    // since ProductCanvas only runs in the browser. Excluding it prevents
    // webpack from choking on the .node binary during static export builds.
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { canvas: "canvas" },
    ];
    return config;
  },
};

export default nextConfig;
