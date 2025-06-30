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

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_CONFIG_FILE = 'next.config.simple.js';

// Run Next.js CLI directly
console.log('🚀 Starting Next.js build with polyfills...');

// Execute the Next.js CLI build command
const { spawn } = require('child_process');
const path = require('path');

// Find the Next.js CLI path - use .cmd extension on Windows
const isWindows = process.platform === 'win32';
const nextBinPath = path.resolve(
  __dirname, 
  'node_modules', 
  '.bin', 
  isWindows ? 'next.cmd' : 'next'
);

console.log(`Using Next.js binary at: ${nextBinPath}`);

// Spawn the Next.js CLI process
const nextProcess = spawn(nextBinPath, ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--require=./direct-fix.js'
  }
});

// Handle process completion
nextProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } else {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});
