// Direct patch for the pnpm route loader file
const fs = require('fs');
const path = require('path');

console.log('🔧 Directly patching pnpm Next.js route loader...');

// Exact path to the pnpm route loader file
const routeLoaderPath = path.join(
  __dirname,
  'node_modules',
  '.pnpm',
  'next@14.2.3_react-dom@18.3.1_react@18.3.1__react@18.3.1',
  'node_modules',
  'next',
  'dist',
  'build',
  'webpack',
  'loaders',
  'next-route-loader',
  'index.js'
);

if (!fs.existsSync(routeLoaderPath)) {
  console.error(`❌ Could not find route loader at: ${routeLoaderPath}`);
  process.exit(1);
}

// Create a backup if it doesn't exist
const backupPath = `${routeLoaderPath}.backup`;
if (!fs.existsSync(backupPath)) {
  console.log(`Creating backup at: ${backupPath}`);
  fs.copyFileSync(routeLoaderPath, backupPath);
}

// Read the original file
let content = fs.readFileSync(routeLoaderPath, 'utf8');

// Apply the patch
console.log('Applying patch to route loader...');

// Create a completely new version of the file with safety checks
const patchedContent = `// PATCHED VERSION OF NEXT ROUTE LOADER
// Original file backed up at ${backupPath}

// Add safety for _source property
function ensureSafeSource(source) {
  if (!source) {
    return { 
      value: "", 
      get() { return this.value; }, 
      set(v) { this.value = v; } 
    };
  }
  return source;
}

${content.replace(
  /const _source = source;/g, 
  'const _source = ensureSafeSource(source);'
).replace(
  /_source\.(\w+)/g, 
  '(_source && _source.$1)'
)}`;

// Write the patched content back
fs.writeFileSync(routeLoaderPath, patchedContent, 'utf8');

console.log('✅ Successfully patched route loader');

// Also define browser globals for server-side code
console.log('🔧 Setting up browser globals for server-side code...');

// Define browser globals
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
