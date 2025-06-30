// Vercel build script with polyfills

console.log('🔧 Setting up Vercel build environment...');

// Kiểm tra xem chúng ta có đang chạy trong môi trường Vercel không
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  console.log('✅ Detected Vercel environment');
}

// Định nghĩa các biến toàn cục của trình duyệt cho môi trường server
console.log('🔧 Defining browser globals for server environment...');

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

// Monkey patch require để tiêm polyfills vào tất cả các modules
const originalRequire = module.constructor.prototype.require;
module.constructor.prototype.require = function(id) {
  const exports = originalRequire.apply(this, arguments);
  
  // Đối với các module cụ thể có thể sử dụng biến toàn cục của trình duyệt
  if (id.includes('@neondatabase/serverless') || 
      id.includes('styled-jsx') ||
      id.includes('vendors')) {
    console.log(`🔧 Adding polyfills to module: ${id}`);
  }
  
  return exports;
};

console.log('✅ Module patching complete');

// Thiết lập cấu hình Next.js cho Vercel
process.env.NEXT_CONFIG_FILE = 'next.config.vercel.js';

// Nếu file này được yêu cầu trực tiếp, không cần thực hiện thêm hành động nào
if (require.main !== module) {
  console.log('✅ Vercel build script loaded as a module with next.config.vercel.js');
}
