// Patch Next.js runtime to define global objects before any code runs

// First, define all browser globals in the global scope
global.self = global;
global.window = global;
global.document = {};
global.navigator = { userAgent: 'node' };
global.localStorage = { getItem: () => null, setItem: () => {} };

// Find the Next.js runtime module
const nextRuntimePath = require.resolve('next/dist/server/next-server');

// Monkey patch the Next.js server module
const fs = require('fs');
const content = fs.readFileSync(nextRuntimePath, 'utf8');

// Check if we need to patch the file
if (!content.includes('// PATCHED FOR SELF DEFINITION')) {
  console.log('🔧 Patching Next.js runtime...');
  
  // Add our patch at the beginning of the file
  const patchedContent = `// PATCHED FOR SELF DEFINITION\n` +
    `global.self = global;\n` +
    `global.window = global;\n` +
    `global.document = global.document || {};\n` +
    `global.navigator = global.navigator || { userAgent: 'node' };\n` +
    `global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {} };\n\n` +
    content;
  
  // Write the patched content back
  fs.writeFileSync(nextRuntimePath, patchedContent, 'utf8');
  
  console.log('✅ Next.js runtime patched successfully');
} else {
  console.log('✅ Next.js runtime already patched');
}

console.log('✅ All global polyfills registered');
