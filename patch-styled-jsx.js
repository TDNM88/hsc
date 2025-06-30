// Patch for styled-jsx module to fix document.querySelector error

const fs = require('fs');
const path = require('path');

console.log('🔧 Patching styled-jsx module...');

// Find the styled-jsx module path
const nodeModulesPath = path.join(__dirname, 'node_modules');
let styledJsxPath = '';

// Look for styled-jsx in both regular and pnpm paths
const possiblePaths = [
  path.join(nodeModulesPath, 'styled-jsx', 'dist', 'index', 'index.js'),
  path.join(nodeModulesPath, '.pnpm', 'styled-jsx@5.1.1_react@18.3.1', 'node_modules', 'styled-jsx', 'dist', 'index', 'index.js')
];

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    styledJsxPath = possiblePath;
    break;
  }
}

if (!styledJsxPath) {
  console.error('❌ Could not find styled-jsx module');
  process.exit(1);
}

console.log(`Found styled-jsx at: ${styledJsxPath}`);

try {
  // Read the file content
  let content = fs.readFileSync(styledJsxPath, 'utf8');
  
  // Check if already patched
  if (content.includes('// PATCHED_FOR_SSR')) {
    console.log('✅ styled-jsx already patched');
  } else {
    // Replace the problematic line that uses document.querySelector
    const originalLine = 'this._sheet = new StyleSheet({';  
    const patchedLine = '// PATCHED_FOR_SSR\n    this._sheet = typeof document !== "undefined" && document.querySelector ? new StyleSheet({';
    
    // Also patch the constructor to handle SSR
    const originalConstructor = 'constructor(options) {';
    const patchedConstructor = 'constructor(options) {\n    // PATCHED_FOR_SSR - Skip in SSR\n    if (typeof document === "undefined" || !document.querySelector) {\n      this._sheet = { cssRules: [], insertRule: () => {} };\n      return;\n    }';
    
    // Apply patches
    content = content.replace(originalLine, patchedLine);
    content = content.replace(originalConstructor, patchedConstructor);
    
    // Write the patched content back
    fs.writeFileSync(styledJsxPath, content, 'utf8');
    
    console.log('✅ Successfully patched styled-jsx');
  }
} catch (error) {
  console.error('❌ Error patching styled-jsx:', error);
}
