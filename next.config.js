/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Optimize for serverless deployment
  output: "standalone",
  
  // Sử dụng transpilePackages để xử lý các package có vấn đề với SSR
  transpilePackages: ["@neondatabase/serverless"],

  experimental: {
    // Không đặt @neondatabase/serverless làm external package để tránh xung đột
    serverComponentsExternalPackages: ["@upstash/redis"],
    // appDir is now stable in Next.js 14, no need to specify
    optimizeCss: true,
  },

  images: {
    domains: ["localhost", "vercel.app", "tradingview.com", "s3.tradingview.com", "widgetdata.tradingview.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["pages", "components", "lib", "hooks"],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: process.env.APP_VERSION || "1.0.0",
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com" : "*",
          },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/trading",
        destination: "/trade",
        permanent: true,
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "/api/:path*",
      },
    ]
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix for "self is not defined" error
    if (isServer) {
      // Add Node.js polyfills for server-side code
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Add polyfill for 'self'
        if (entries['main.js'] && !entries['main.js'].includes('./lib/polyfills.js')) {
          entries['main.js'].unshift('./lib/polyfills.js');
        }
        
        return entries;
      };
    }
    
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    }

    // Add custom webpack config here
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    }

    // Add support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Xử lý lỗi "self is not defined" cho @neondatabase/serverless
    if (!isServer) {
      // Trên client side, thay thế @neondatabase/serverless bằng một module rỗng
      config.resolve.alias = {
        ...config.resolve.alias,
        '@neondatabase/serverless': require.resolve('./lib/client-stubs/neon-stub.js'),
      };
      
      // Thêm các fallback cho các module Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
      };
    } else {
      // Thêm alias cho môi trường server
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": require("path").resolve(__dirname),
      }
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    return config
  },

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // API routes configuration - moved to route handlers in Next.js 14
  // Body parser settings are now configured in route handlers
  
  // Internationalization (if needed)
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    localeDetection: false,
  },

  // Trailing slash
  trailingSlash: false,

  // Asset prefix for CDN
  assetPrefix: process.env.NODE_ENV === "production" ? process.env.CDN_URL || "" : "",
}

module.exports = nextConfig
