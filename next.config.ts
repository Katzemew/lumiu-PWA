import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: false, // Force enable for testing Offline Sync in both Dev and Prod
  workboxOptions: {
    skipWaiting: true,
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
  }
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.167', 'localhost', '127.0.0.1', '10.128.47.1'],
  turbopack: {},
  compress: true,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  }
};

export default withPWA(nextConfig);
