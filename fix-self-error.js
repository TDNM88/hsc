// Direct fix for "self is not defined" error in Next.js

// Define all browser globals in the global scope
global.self = global;
global.window = global;
global.document = {};
global.navigator = { userAgent: 'node' };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {} };

// Monkey patch the require function to ensure our globals are defined before any module loads
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  // Ensure globals are defined before any module loads
  global.self = global;
  global.window = global;
  
  // Call the original require
  return originalRequire.apply(this, arguments);
};

// Function to directly patch the vendors.js file
function patchVendorsFile() {
  const fs = require('fs');
  const path = require('path');
  
  const vendorsPath = path.join(__dirname, '.next', 'server', 'vendors.js');
  
  if (fs.existsSync(vendorsPath)) {
    console.log('🔧 Patching vendors.js file...');
    
    try {
      // Read the file content
      let content = fs.readFileSync(vendorsPath, 'utf8');
      
      // Add polyfill code at the beginning of the file
      const polyfillCode = `// Polyfill for browser globals\n` +
        `global.self = global;\n` +
        `global.window = global;\n` +
        `global.document = {};\n` +
        `global.navigator = { userAgent: 'node' };\n` +
        `global.localStorage = { getItem: () => null, setItem: () => {} };\n\n`;
      
      // Only add if not already patched
      if (!content.includes('global.self = global')) {
        content = polyfillCode + content;
        
        // Write the modified content back to the file
        fs.writeFileSync(vendorsPath, content, 'utf8');
        console.log('✅ Successfully patched vendors.js file');
      } else {
        console.log('✅ vendors.js already patched');
      }
    } catch (error) {
      console.error('❌ Error patching vendors.js file:', error);
    }
  }
}

// Export a function to run the patch
exports.patchVendors = patchVendorsFile;

// Export a function to run Next.js with our globals defined
exports.runWithPolyfills = function(nextCommand) {
  // Ensure globals are defined
  global.self = global;
  global.window = global;
  
  // Run the Next.js command
  require(nextCommand);
};

console.log('✅ Browser globals defined successfully');
