/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

// Bundle Analyzer needs to be optional and only loaded if requested
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
        hostname: 'pub-b68c5a7939e1ea0b651791359c78326b.r2.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'jqrwunmxblzebmvmugju.supabase.co',
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
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  webpack: (config) => config,
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
  async redirects() {
    return [
      {
        source: '/:locale(fr|ar|en)/admin/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
      {
        source: '/:locale(fr|ar|en)/admin',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));

