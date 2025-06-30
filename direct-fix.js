// Direct fix for the "self is not defined" error in Next.js

// Define global objects that might be missing in Node.js environment
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

console.log('✅ Global browser objects defined successfully');
