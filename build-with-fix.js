// Custom build script with self error fix

// First, load our fix-self-error module
require('./fix-self-error');

// Run the Next.js build command
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js build with polyfills...');

// Run the Next.js build command - use next.js directly from its package
const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const buildProcess = spawn('node', [nextBin, 'build'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '--require ./fix-self-error.js' }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully');
    
    // Patch the vendors.js file after build
    const { patchVendors } = require('./fix-self-error');
    patchVendors();
  } else {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});
