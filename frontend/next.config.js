/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

// Bundle Analyzer needs to be optional and only loaded if requested
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const API_URL_RAW = process.env.NEXT_PUBLIC_API_URL || 'https://mj-chauffage-backend.onrender.com';
// Ensure we always proxy to the backend origin (strip any path like /api/v1)
let BACKEND_ORIGIN;
try {
  BACKEND_ORIGIN = new URL(API_URL_RAW).origin;
} catch {
  BACKEND_ORIGIN = 'https://mj-chauffage-backend.onrender.com';
}

const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 60,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  generateBuildId: async () => 'local-dev',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.mjchauffage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mj-chauffage-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-b68c5a7939e1ea0b651791359c78326b.r2.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/auth/login',
          destination: `${BACKEND_ORIGIN}/api/auth/login`,
        },
        {
          source: '/api/auth/register',
          destination: `${BACKEND_ORIGIN}/api/auth/register`,
        },
        {
          source: '/api/auth/social-login',
          destination: `${BACKEND_ORIGIN}/api/auth/social-login`,
        },
        {
          source: '/api/auth/me',
          destination: `${BACKEND_ORIGIN}/api/auth/me`,
        },
        {
          source: '/api/auth/logout',
          destination: `${BACKEND_ORIGIN}/api/auth/logout`,
        },
        {
          source: '/api/admin/:path*',
          destination: `${BACKEND_ORIGIN}/api/admin/:path*`,
        },
        {
          source: '/api/:path((?!auth).*)',
          destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
        },
        {
          source: '/files/:path*',
          destination: `${BACKEND_ORIGIN}/files/:path*`,
        },
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
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/:locale(fr|ar)/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept-Encoding, User-Agent',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
