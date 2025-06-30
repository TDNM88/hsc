// Custom webpack plugin to inject polyfills for 'self' and other browser globals

class SelfPolyfillPlugin {
  apply(compiler) {
    // Apply the plugin before any modules are parsed
    compiler.hooks.compilation.tap('SelfPolyfillPlugin', (compilation) => {
      // Tap into the normal-module-loader hook
      compilation.hooks.normalModuleLoader.tap('SelfPolyfillPlugin', (loaderContext, module) => {
        // Check if this is a server-side module
        if (compiler.options.name === 'server') {
          // Add our polyfill code to the beginning of each module
          const originalSource = module.originalSource;
          if (originalSource && typeof originalSource === 'function') {
            const originalSourceValue = originalSource();
            if (originalSourceValue && typeof originalSourceValue.source === 'function') {
              const source = originalSourceValue.source();
              if (typeof source === 'string') {
                // Prepend our polyfill code
                const polyfillCode = `
                  // Polyfill for browser globals
                  if (typeof global !== 'undefined') {
                    if (typeof self === 'undefined') global.self = global;
                    if (typeof window === 'undefined') global.window = global;
                  }
                `;
                module._source = {
                  source: () => polyfillCode + source,
                  size: () => polyfillCode.length + source.length
                };
              }
            }
          }
        }
      });
    });
  }
}

module.exports = SelfPolyfillPlugin;
