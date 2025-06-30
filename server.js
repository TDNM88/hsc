// Custom Next.js server with polyfills

// Load polyfills before anything else
require('./next-polyfill');

const { createServer } = require('http');
const { parse } = require('url');

// Use our custom next module with polyfills
const next = require('./next-polyfill');

// Additional polyfills for browser globals
global.self = global;
global.window = global;
global.navigator = { userAgent: 'node' };
global.document = global.document || {};
global.localStorage = global.localStorage || { getItem: () => null, setItem: () => {} };

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
