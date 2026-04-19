import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // Force enable for testing Offline Sync in both Dev and Prod
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'lumiu-offline-sync',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 Days
        },
        cacheableResponse: {
          statuses: [0, 200]
        },
      }
    }
  ]
});

const nextConfig: NextConfig = {
  turbopack: {}
};

export default withPWA(nextConfig);
