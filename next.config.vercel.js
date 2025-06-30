/** @type {import('next').NextConfig} */

// Cấu hình đặc biệt cho Vercel
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  transpilePackages: ["@neondatabase/serverless"],
  experimental: {
    serverComponentsExternalPackages: ["@upstash/redis"],
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
  
  // Cấu hình webpack cho Vercel
  webpack: (config, { isServer, webpack }) => {
    // Thêm polyfills cho browser globals ở phía server
    if (isServer) {
      // Sử dụng DefinePlugin để định nghĩa các biến toàn cục
      config.plugins.push(
        new webpack.DefinePlugin({
          'global.self': 'global',
          'global.window': 'global',
          'global.document': 'global.document || {}',
          'global.navigator': 'global.navigator || { userAgent: "node" }',
          'global.localStorage': 'global.localStorage || { getItem: () => null, setItem: () => {} }',
          'global.sessionStorage': 'global.sessionStorage || { getItem: () => null, setItem: () => {} }'
        })
      );
      
      // Thêm plugin để tiêm polyfills vào đầu các bundle server
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('InjectPolyfillsPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
              { name: 'InjectPolyfillsPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
              (assets) => {
                // Tiêm polyfills vào các file server
                Object.keys(assets).forEach(key => {
                  if (key.endsWith('.js')) {
                    const asset = assets[key];
                    const content = asset.source();
                    const polyfills = `
                      // Polyfills for browser globals in server environment
                      self = self || global;
                      window = window || global;
                      document = document || {
                        createElement: () => ({ style: {}, setAttribute: () => {}, getElementsByTagName: () => [], appendChild: () => {} }),
                        createTextNode: () => ({}),
                        head: { appendChild: () => {} },
                        body: { appendChild: () => {} },
                        documentElement: { style: {} },
                        getElementById: () => null,
                        querySelector: () => null,
                        querySelectorAll: () => [],
                        getElementsByClassName: () => []
                      };
                      navigator = navigator || { userAgent: 'node' };
                      localStorage = localStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
                      sessionStorage = sessionStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
                    `;
                    asset.source = () => polyfills + content;
                  }
                });
              }
            );
          });
        }
      });
    }
    
    // Cẩn thận khi mở rộng config.resolve.alias
    if (config.resolve && config.resolve.alias) {
      // Mở rộng alias một cách an toàn
      const originalAlias = { ...config.resolve.alias };
      config.resolve.alias = {
        ...originalAlias,
        // Thêm các alias cần thiết ở đây
      };
    }
    
    // Cẩn thận khi mở rộng config.resolve.fallback
    if (config.resolve && config.resolve.fallback) {
      // Mở rộng fallback một cách an toàn
      const originalFallback = { ...config.resolve.fallback };
      config.resolve.fallback = {
        ...originalFallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
