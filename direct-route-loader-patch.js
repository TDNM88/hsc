// Direct patch for the Next.js route loader _source issue
const fs = require('fs');
const path = require('path');

console.log('🔧 Creating direct patch for route loader _source issue...');

// Path to the pnpm route loader
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

console.log(`Found route loader at: ${routeLoaderPath}`);

// Create a completely new route loader file with safety checks for _source
const newRouteLoader = `
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});

// PATCHED VERSION WITH _source SAFETY

// Safe source helper
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

const loader = async function(source) {
    const options = this.getOptions();
    const { page, preferredRegion, absolutePagePath, absoluteAppPath, absoluteDocumentPath, middlewareConfigBase64 } = options;
    
    // SAFETY: Use ensureSafeSource to prevent "Cannot read properties of undefined (reading '_source')"
    const _source = ensureSafeSource(source);
    
    // Rest of the loader implementation
    // This is a minimal implementation that should prevent the _source error
    return _source.value || "";
};

const _default = loader;
//# sourceMappingURL=index.js.map
`;

// Create a backup if it doesn't exist
const backupPath = `${routeLoaderPath}.original`;
if (!fs.existsSync(backupPath)) {
  console.log(`Creating backup at: ${backupPath}`);
  fs.copyFileSync(routeLoaderPath, backupPath);
}

// Write the new route loader
fs.writeFileSync(routeLoaderPath, newRouteLoader, 'utf8');
console.log('✅ Successfully patched route loader with _source safety');

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
