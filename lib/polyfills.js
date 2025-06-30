// Polyfills for browser globals in Node.js environment

if (typeof global !== 'undefined') {
  // Define self if it doesn't exist (for server-side rendering)
  if (typeof self === 'undefined') {
    global.self = global;
  }

  // Define window if it doesn't exist
  if (typeof window === 'undefined') {
    global.window = global;
  }

  // Define document if it doesn't exist
  if (typeof document === 'undefined') {
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: {
        style: {},
      },
    };
  }

  // Define navigator if it doesn't exist
  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'node',
      platform: process.platform,
    };
  }

  // Define location if it doesn't exist
  if (typeof location === 'undefined') {
    global.location = { href: 'http://localhost' };
  }

  // Define localStorage if it doesn't exist
  if (typeof localStorage === 'undefined') {
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }

  // Define sessionStorage if it doesn't exist
  if (typeof sessionStorage === 'undefined') {
    global.sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
}
