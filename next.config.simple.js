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
  
  // Simple webpack configuration that only adds the necessary polyfills
  webpack: (config, { isServer, webpack }) => {
    // Add polyfills for browser globals on server side
    if (isServer) {
      // Use DefinePlugin to define globals
      config.plugins.push(
        new webpack.DefinePlugin({
          'global.self': 'global',
          'global.window': 'global',
          'global.document': 'global.document || {}',
          'global.navigator': 'global.navigator || { userAgent: "node" }',
          'global.localStorage': 'global.localStorage || { getItem: () => null, setItem: () => {} }'
        })
      );
      
      // Add a plugin to inject polyfills at the beginning of server bundles
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('InjectPolyfillsPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
              { name: 'InjectPolyfillsPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
              (assets) => {
                // Inject polyfills into server files
                Object.keys(assets).forEach(key => {
                  if (key.endsWith('.js')) {
                    const asset = assets[key];
                    const content = asset.source();
                    
                    // Only inject if not already injected
                    if (!content.includes('// POLYFILL_MARKER')) {
                      const polyfill = `// POLYFILL_MARKER\nglobal.self = global;\nglobal.window = global;\nglobal.document = global.document || {\n  createElement: () => ({\n    style: {},\n    setAttribute: () => {},\n    getElementsByTagName: () => [],\n    appendChild: () => {}\n  }),\n  createTextNode: () => ({}),\n  head: { appendChild: () => {} },\n  body: { appendChild: () => {} },\n  documentElement: { style: {} },\n  getElementById: () => null,\n  querySelector: () => null,\n  querySelectorAll: () => []\n};\nglobal.navigator = global.navigator || { userAgent: 'node' };\nglobal.localStorage = global.localStorage || { getItem: () => null, setItem: () => {} };\n\n`;
                      
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
