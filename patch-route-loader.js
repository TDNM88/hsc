// Script to patch Next.js route loader
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching Next.js route loader...');

// Find the Next.js route loader path
const nodeModulesPath = path.join(__dirname, 'node_modules');
let routeLoaderPath = '';

// Look for the route loader in both regular and pnpm paths
const possiblePaths = [
  // Try the pnpm path first since that's what the error shows
  path.join(nodeModulesPath, '.pnpm', 'next@14.2.3_react-dom@18.3.1_react@18.3.1__react@18.3.1', 'node_modules', 'next', 'dist', 'build', 'webpack', 'loaders', 'next-route-loader', 'index.js'),
  path.join(nodeModulesPath, 'next', 'dist', 'build', 'webpack', 'loaders', 'next-route-loader', 'index.js')
];

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    routeLoaderPath = possiblePath;
    break;
  }
}

if (!routeLoaderPath) {
  console.error('❌ Could not find Next.js route loader');
  process.exit(1);
}

console.log(`Found Next.js route loader at: ${routeLoaderPath}`);

try {
  // Create a backup of the original file
  const backupPath = `${routeLoaderPath}.backup`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(routeLoaderPath, backupPath);
    console.log(`✅ Created backup at ${backupPath}`);
  }

  // Read the file content
  let content = fs.readFileSync(routeLoaderPath, 'utf8');
  
  // Check if already patched
  if (content.includes('// PATCHED_FOR_SOURCE_ISSUE')) {
    console.log('✅ Route loader already patched');
  } else {
    // Add a safety check for _source property - more aggressive patch
    let patchedContent = content;
    
    // First patch: Replace direct assignments
    patchedContent = patchedContent.replace(
      /(_source\s*=\s*source)/g,
      '// PATCHED_FOR_SOURCE_ISSUE\n      _source = source || { value: "", get() { return this.value; }, set(v) { this.value = v; } }'
    );
    
    // Second patch: Add safety checks before any _source usage
    patchedContent = patchedContent.replace(
      /(_source\.(\w+))/g,
      '(_source && _source.$2)'
    );
    
    // Third patch: Add a global safety mechanism at the beginning of the file
    const safetyCode = `
// PATCHED_FOR_SOURCE_ISSUE - Global safety mechanism
function ensureSafeSource(obj) {
  if (!obj || typeof obj !== 'object') return { value: "", get() { return this.value; }, set(v) { this.value = v; } };
  return obj;
}
`;
    
    patchedContent = safetyCode + patchedContent;
    
    // Write the patched content back
    fs.writeFileSync(routeLoaderPath, patchedContent, 'utf8');
    
    console.log('✅ Successfully patched Next.js route loader');
  }
} catch (error) {
  console.error('❌ Error patching Next.js route loader:', error);
}

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
  getElementsByClassName: () => [],
};
global.navigator = global.navigator || { userAgent: 'node' };
global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
global.sessionStorage = global.sessionStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };

console.log('✅ Browser globals defined for server-side code');
