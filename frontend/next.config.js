const createNextIntlPlugin = require('next-intl/plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const API_URL_RAW = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// Ensure we always proxy to the backend origin (strip any path like /api/v1)
let BACKEND_ORIGIN;
try {
  BACKEND_ORIGIN = new URL(API_URL_RAW).origin;
} catch {
  BACKEND_ORIGIN = 'http://localhost:3001';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 60,
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  generateBuildId: async () => 'local-dev',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.mjchauffage.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXT_PUBLIC_API_URL: API_URL_RAW,
    API_URL_SSR: process.env.API_URL_SSR || API_URL_RAW,
    BACKEND_API_URL: process.env.BACKEND_API_URL || `${process.env.API_URL_SSR || API_URL_RAW}/api/v1`,
  },
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  webpack: (config) => config,
  async rewrites() {
    // Use afterFiles so local API routes take precedence; proxy unknown API paths to backend
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
        },
        // Proxy /files directly to backend (for images)
        {
          source: '/files/:path*',
          destination: `${BACKEND_ORIGIN}/files/:path*`,
        },
        // Proxy /images alias to backend uploads as well
        {
          source: '/images/:path*',
          destination: `${BACKEND_ORIGIN}/images/:path*`,
        },
      ],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
