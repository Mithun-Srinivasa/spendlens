import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Empty turbopack config silences the Turbopack+webpack conflict warning
  // that Next.js 16 emits when it detects a webpack: config without turbopack: config.
  turbopack: {},

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://mithun-srinivasa.github.io",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://mithun-srinivasa.github.io",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse transitively references canvas on some code paths.
      // Marking it as external prevents bundling errors on Vercel.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "canvas",
      ];
    }
    return config;
  },
};

export default nextConfig;
