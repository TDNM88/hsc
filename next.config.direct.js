// Direct fix for "self is not defined" error in Next.js

/** @type {import('next').NextConfig} */
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
  
  // The critical fix for "self is not defined" error
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add a plugin to inject polyfills at the beginning of each module
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('InjectPolyfillsPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
              { name: 'InjectPolyfillsPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
              (assets) => {
                // Inject polyfills into vendors.js and any other server files
                Object.keys(assets).forEach(key => {
                  if (key.endsWith('.js')) {
                    const asset = assets[key];
                    const content = asset.source();
                    
                    // Only inject if not already injected
                    if (!content.includes('// POLYFILL_MARKER')) {
                      const polyfill = `// POLYFILL_MARKER\nglobal.self = global;\nglobal.window = global;\nglobal.document = global.document || {};\nglobal.navigator = global.navigator || { userAgent: 'node' };\nglobal.localStorage = global.localStorage || { getItem: () => null, setItem: () => {} };\n\n`;
                      
                      const newSource = polyfill + content;
                      assets[key] = {
                        source: () => newSource,
                        size: () => newSource.length
                      };
                    }
                  }
                });
              }
            );
          });
        }
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;
