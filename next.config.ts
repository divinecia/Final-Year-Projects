import { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Essential optimizations only
  compress: true,
  poweredByHeader: false,
  
  // Disable security warnings for development
  onDemandEntries: {
    // Keep pages in memory for 60 seconds
    maxInactiveAge: 60 * 1000,
  },
  
  // Allow dev origins for all environments
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Set dev indicators to false to reduce warnings
  devIndicators: {
    position: 'bottom-right',
  },
  
  // Configure allowed origins for development and security headers in server mode
  async headers() {
    const headers = [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];

    if (!process.env.BUILD_TARGET) {
      headers.push({
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      });
    }

    return headers as any;
  },
  serverExternalPackages: ["@google-cloud/storage"],
  
  // Enable transpilation for better module resolution
  transpilePackages: [],
  
  // Output configuration for deployment
  output: process.env.BUILD_TARGET === 'static' ? 'export' : 
          process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Static export configuration
  ...(process.env.BUILD_TARGET === 'static' && {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
    // Skip API routes during static export as they require server-side functionality
    generateBuildId: () => 'static-build',
  }),
  
  // Build settings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Image optimizations
  images: {
    ...(process.env.BUILD_TARGET === 'static' && {
      unoptimized: true, // Required for static export
    }),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.io',
        pathname: '/**',
      }
    ],
  },  
  
  // Webpack configuration for both warnings suppression and path resolution
  webpack: (config: import('webpack').Configuration, { isServer }: { isServer: boolean }) => {
    // Handle handlebars warnings and node.js compatibility
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        'handlebars': false,
      };
      
      // Add fallback for node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'fs': false,
        'path': false,
        'os': false,
        'util': false,
      };
    }

    // Add explicit path resolution for Vercel
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/app': path.resolve(__dirname, 'app'),
    };

    // Suppress handlebars warnings
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push(
      {
        module: /handlebars/,
        message: /require\.extensions/,
      },
      {
        module: /handlebars/,
        message: /not supported by webpack/,
      }
    );

    return config;
  },
};

export default nextConfig;
