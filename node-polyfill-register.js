// Register a custom require hook to inject polyfills before any module loads

const Module = require('module');
const originalRequire = Module.prototype.require;

// Define polyfills
if (typeof global !== 'undefined') {
  global.self = global;
  global.window = global;
  global.document = global.document || {};
  global.navigator = global.navigator || { userAgent: 'node' };
  global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {} };
}

// Override the require function to inject polyfills
Module.prototype.require = function(id) {
  // Call the original require
  const result = originalRequire.apply(this, arguments);
  
  // Return the result
  return result;
};

console.log('✅ Global polyfills registered successfully');
