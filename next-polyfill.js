// This file must be loaded before any other Next.js code

// Define self and other browser globals before anything else loads
if (typeof global !== 'undefined') {
  // Define self if it doesn't exist
  if (typeof self === 'undefined') {
    global.self = global;
  }

  // Define window if it doesn't exist
  if (typeof window === 'undefined') {
    global.window = global;
  }

  // Define document if it doesn't exist
  if (typeof document === 'undefined') {
    global.document = {};
  }

  // Define navigator if it doesn't exist
  if (typeof navigator === 'undefined') {
    global.navigator = { userAgent: 'node' };
  }

  // Define localStorage if it doesn't exist
  if (typeof localStorage === 'undefined') {
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    };
  }
}

// Now export Next.js
module.exports = require('next');
