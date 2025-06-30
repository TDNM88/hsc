// Patch Next.js runtime files to fix "self is not defined" error

const fs = require('fs');
const path = require('path');

// Define our polyfill code
const polyfillCode = `
// Polyfill for browser globals in Node.js environment
global.self = global;
global.window = global;

// Create a more complete document mock
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
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.navigator = global.navigator || { userAgent: 'node' };
global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
global.sessionStorage = global.sessionStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
`;

// Function to patch a file
function patchFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Patching ${filePath}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Only patch if not already patched
      if (!content.includes('global.self = global')) {
        content = polyfillCode + content;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Successfully patched ${filePath}`);
      } else {
        console.log(`File already patched: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error);
  }
}

// Find Next.js module paths
const nodeModulesPath = path.join(__dirname, 'node_modules');
const nextServerPath = path.join(nodeModulesPath, 'next', 'dist', 'server');

// Files to patch
const filesToPatch = [
  path.join(nextServerPath, 'require-hook.js'),
  path.join(nextServerPath, 'next-server.js'),
  path.join(nextServerPath, 'next.js'),
  path.join(nextServerPath, 'lib', 'patch-fetch.js'),
  path.join(nextServerPath, 'load-components.js'),
];

console.log('🔧 Patching Next.js files to fix "self is not defined" error...');

// Patch each file
filesToPatch.forEach(patchFile);

console.log('✅ Patching complete!');
