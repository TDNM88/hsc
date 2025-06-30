// Complete replacement for styled-jsx module to fix document.querySelector error

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating complete replacement for styled-jsx module...');

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

// Create a complete replacement for the StyleSheet class
const replacementCode = `
// COMPLETE REPLACEMENT FOR STYLED-JSX TO FIX SSR ISSUES
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

// SSR-safe StyleSheet implementation
class StyleSheet {
  constructor(options) {
    this.cssRules = [];
    this.tag = null;
    
    // Skip actual DOM operations in SSR
    if (typeof document === 'undefined' || !document.querySelector) {
      return;
    }
    
    // Only run in browser environment
    try {
      // The original code that we're replacing for SSR compatibility
      if (options.container) {
        this.element = options.container;
      } else {
        this.element = document.querySelector('style[data-styled-jsx]');
        if (!this.element) {
          this.element = document.createElement('style');
          this.element.setAttribute('data-styled-jsx', '');
          document.head.appendChild(this.element);
        }
      }
      
      this.sheet = this.element.sheet;
      this.rules = {};
    } catch (e) {
      console.error('Error initializing StyleSheet:', e);
      // Provide fallbacks for server-side rendering
      this.sheet = { cssRules: [] };
      this.rules = {};
    }
  }
  
  insertRule(rule, index) {
    // Skip in SSR environment
    if (typeof document === 'undefined' || !document.querySelector) {
      this.cssRules.push(rule);
      return 0;
    }
    
    try {
      if (this.sheet) {
        return this.sheet.insertRule(rule, index);
      }
    } catch (e) {
      console.error('Error inserting rule:', e);
    }
    return 0;
  }
}

// Server-side compatible StyleSheetRegistry
class StyleSheetRegistry {
  constructor() {
    this._sheet = new StyleSheet({ container: null });
    this._fromServer = null;
    this._indices = {};
    this._instancesCounts = {};
  }
  
  add(props) {
    // SSR-safe implementation
    if (typeof window === 'undefined') {
      return;
    }
    
    // Rest of the original implementation...
    // Simplified for SSR compatibility
    const { styleId, rules } = props;
    
    if (styleId in this._instancesCounts) {
      this._instancesCounts[styleId] += 1;
      return;
    }

    this._instancesCounts[styleId] = 1;
    
    // Add rules to the StyleSheet
    if (rules) {
      rules.forEach(rule => {
        this._sheet.insertRule(rule);
      });
    }
  }
  
  remove(props) {
    // SSR-safe implementation
    if (typeof window === 'undefined') {
      return;
    }
    
    const { styleId } = props;
    this._instancesCounts[styleId] -= 1;
    
    if (this._instancesCounts[styleId] <= 0) {
      delete this._instancesCounts[styleId];
      // Would remove rules here in the original implementation
    }
  }
}

// Create a registry once for the whole application
const styleRegistry = typeof window !== 'undefined' ? new StyleSheetRegistry() : null;

function createStyleRegistry() {
  return styleRegistry || new StyleSheetRegistry();
}

// Export the styled-jsx API
exports.style = function style(jsx) {
  return jsx;
};

exports.StyleRegistry = StyleSheetRegistry;
exports.createStyleRegistry = createStyleRegistry;

// Export the JSX pragma
exports.default = function(props) {
  // Server-side rendering safe implementation
  return React.createElement('style', props);
};
`;

try {
  // Write the replacement file
  fs.writeFileSync(styledJsxPath, replacementCode, 'utf8');
  console.log('✅ Successfully replaced styled-jsx module with SSR-compatible version');
} catch (error) {
  console.error('❌ Error replacing styled-jsx module:', error);
}
