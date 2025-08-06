const nextConfig = {
  // Essential optimizations only
  compress: true,
  poweredByHeader: false,
  
  // Allow dev origins for Replit
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Suppress edge runtime warnings for middleware
    serverComponentsExternalPackages: [],
  },
  
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
  // Webpack optimizations with handlebars warning suppression
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

    // Ignore handlebars warnings
    config.ignoreWarnings = [
      {
        module: /handlebars/,
        message: /require\.extensions/,
      },
      {
        module: /handlebars/,
        message: /not supported by webpack/,
      }
    ];

    return config;
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
};

module.exports = nextConfig;
