import { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Essential optimizations only
  compress: true,
  poweredByHeader: false,
  
  // Allow dev origins for Replit
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  serverExternalPackages: ["@google-cloud/storage"],
  
  // Enable transpilation for better module resolution
  transpilePackages: [],
  
  // Configure allowed dev origins for Replit
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      '*.replit.dev',
      '*.repl.co',
      'localhost:3000',
      '0.0.0.0:3000'
    ]
  }),
  
  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Build settings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Image optimizations
  images: {
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
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
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
