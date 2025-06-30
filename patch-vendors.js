// Script to patch the vendors.js file after build
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching vendors.js file...');

// Path to the vendors.js file
const vendorsPath = path.join(__dirname, '.next', 'server', 'vendors.js');

// Check if the file exists
if (fs.existsSync(vendorsPath)) {
  try {
    // Read the file content
    let content = fs.readFileSync(vendorsPath, 'utf8');
    
    // Add polyfill code at the beginning of the file
    const polyfillCode = `// Polyfill for browser globals\n` +
      `if (typeof global !== 'undefined') {\n` +
      `  global.self = global;\n` +
      `  global.window = global;\n` +
      `  global.document = global.document || {};\n` +
      `  global.navigator = global.navigator || { userAgent: 'node' };\n` +
      `  global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {} };\n` +
      `}\n\n`;
    
    // Add the polyfill code at the beginning of the file
    content = polyfillCode + content;
    
    // Write the modified content back to the file
    fs.writeFileSync(vendorsPath, content, 'utf8');
    
    console.log('✅ Successfully patched vendors.js file');
  } catch (error) {
    console.error('❌ Error patching vendors.js file:', error);
  }
} else {
  console.error('❌ vendors.js file not found at:', vendorsPath);
}
