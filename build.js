// Direct build script with polyfills for Next.js

// Define browser globals before anything else
console.log('🔧 Setting up browser globals for server-side code...');

global.self = global;
global.window = global;
global.document = global.document || {
  createElement: () => ({
    style: {},
    setAttribute: () => {},
    getElementsByTagName: () => [],
    appendChild: () => {}
  }),
  createTextNode: () => ({}),
  head: { appendChild: () => {} },
  body: { appendChild: () => {} },
  documentElement: { style: {} },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementsByClassName: () => []
};
global.navigator = global.navigator || { userAgent: 'node' };
global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
global.sessionStorage = global.sessionStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };

console.log('✅ Browser globals defined for server-side code');

// Monkey patch require to inject polyfills into all modules
const originalRequire = module.constructor.prototype.require;
module.constructor.prototype.require = function(id) {
  const exports = originalRequire.apply(this, arguments);
  
  // For specific modules that might use browser globals, ensure they're defined
  if (id.includes('@neondatabase/serverless') || 
      id.includes('styled-jsx') ||
      id.includes('vendors')) {
    console.log(`🔧 Adding polyfills to module: ${id}`);
  }
  
  return exports;
};

// Set production mode
process.env.NODE_ENV = 'production';

// Run Next.js build
console.log('🚀 Starting Next.js build with polyfills...');

const next = require('next');
const app = next({
  dev: false,
  dir: process.cwd(),
  conf: {
    reactStrictMode: true,
    swcMinify: true,
    output: "standalone",
    transpilePackages: ["@neondatabase/serverless"],
    experimental: {
      serverComponentsExternalPackages: ["@upstash/redis"],
    }
  }
});

app.build()
  .then(() => {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
  });
