#!/usr/bin/env node

// Script đặc biệt để build Next.js trên Vercel
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Thiết lập môi trường
process.env.NODE_ENV = 'production';
process.env.NEXT_CONFIG_FILE = 'next.config.vercel.js';

// Định nghĩa các biến toàn cục của trình duyệt
console.log('🔧 Setting up browser globals for Vercel environment...');

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

// Tìm đường dẫn đến next
const findNextBin = () => {
  // Các đường dẫn có thể có của next binary
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', '.bin', 'next'),
    path.join(process.cwd(), 'node_modules', '.bin', 'next.cmd'),
    path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next'),
    '/vercel/path0/node_modules/.bin/next',
    '/vercel/path0/node_modules/next/dist/bin/next'
  ];

  for (const nextPath of possiblePaths) {
    try {
      if (fs.existsSync(nextPath)) {
        console.log(`✅ Found Next.js binary at: ${nextPath}`);
        return nextPath;
      }
    } catch (err) {
      // Bỏ qua lỗi và tiếp tục kiểm tra đường dẫn tiếp theo
    }
  }

  // Nếu không tìm thấy, thử sử dụng next từ node_modules
  try {
    const nextModule = require('next');
    console.log('✅ Found Next.js module, using programmatic API');
    return null; // Trả về null để sử dụng API thay vì binary
  } catch (err) {
    console.error('❌ Could not find Next.js module or binary');
    throw new Error('Next.js not found');
  }
};

// Thực hiện build
const runBuild = () => {
  const nextBin = findNextBin();
  
  if (nextBin) {
    // Sử dụng binary
    console.log(`🚀 Running Next.js build using binary: ${nextBin}`);
    try {
      execSync(`node ${nextBin} build`, { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (err) {
      console.error('❌ Build failed:', err);
      process.exit(1);
    }
  } else {
    // Sử dụng API
    console.log('🚀 Running Next.js build using programmatic API');
    try {
      const next = require('next');
      const builder = next.default;
      builder.build(process.cwd())
        .then(() => {
          console.log('✅ Build completed successfully');
        })
        .catch((err) => {
          console.error('❌ Build failed:', err);
          process.exit(1);
        });
    } catch (err) {
      console.error('❌ Failed to use Next.js API:', err);
      process.exit(1);
    }
  }
};

// Bắt đầu quá trình build
console.log('🚀 Starting Next.js build process on Vercel...');
runBuild();
