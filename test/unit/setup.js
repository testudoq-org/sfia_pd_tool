// test/unit/setup.js
// Jest setup file for SFIA unit tests

const fs = require('fs');
const path = require('path');

// Mock window.location for URL testing
Object.defineProperty(window, 'location', {
  value: {
    hash: '',
    origin: 'http://127.0.0.1:5501',
    pathname: '/sfiapdgen.html',
    hostname: '127.0.0.1'
  },
  writable: true
});

// Mock global variables that are normally defined in constants.js
global.g_sfiahash = '';
global.g_lorhash = '';
global.lastExportTime = 0;

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup DOM mocking
global.document = document;
global.window = window;

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: jest.fn((key) => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; }),
};
global.localStorage = localStorageMock;

// Mock fetch for data fetching tests
global.fetch = jest.fn();

// Function to load and execute source files in global context
global.loadSourceFile = function(relativePath) {
  const filePath = path.resolve(__dirname, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  
  // Execute in global context to make functions available
  const vm = require('vm');
  const context = {
    ...global,
    window: global.window,
    document: global.document,
    console: global.console,
    g_sfiahash: global.g_sfiahash,
    g_lorhash: global.g_lorhash,
    lastExportTime: global.lastExportTime
  };
  
  vm.createContext(context);
  vm.runInContext(source, context);
  
  // Copy defined functions back to global scope
  Object.keys(context).forEach(key => {
    if (typeof context[key] === 'function' && !global[key]) {
      global[key] = context[key];
    }
  });
};

// Enhanced ES6 module loading support
global.loadES6Module = async function(modulePath) {
  try {
    // For ES6 modules, use dynamic import
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.warn(`Failed to load ES6 module ${modulePath}:`, error);
    return null;
  }
};

// Updated loadSourceFile to handle both .js and .mjs files
global.loadMJSModule = async function(relativePath) {
  const filePath = path.resolve(__dirname, relativePath);
  try {
    // Create mock modules for dependencies
    const mockModules = {
      './constants.mjs': {
        g_sfiahash: global.g_sfiahash || '',
        g_lorhash: global.g_lorhash || '',
        lastExportTime: global.lastExportTime || 0
      },
      './initializeContent.mjs': {
        initializeLorContent: jest.fn(),
        initializeSFIAContent: jest.fn()
      },
      './tableRendering.mjs': {
        renderLorOutput: jest.fn(),
        renderSfiaOutput: jest.fn()
      }
    };
    
    // Read the module file
    const moduleContent = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statements with mock implementations and make functions available globally
    let processedContent = moduleContent
      .replace(/import\s+\{\s*lastExportTime\s*\}\s+from\s+['"]\.\/constants\.mjs['"];?/g, 'const lastExportTime = global.lastExportTime;')
      .replace(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?/g, '')
      .replace(/export\s+function\s+(\w+)/g, 'global.$1 = function $1')
      .replace(/export\s+const\s+(\w+)\s*=/g, 'global.$1 = ')
      .replace(/export\s+\{[^}]+\};?/g, '');
    
    // Handle export { ... } blocks and attach to global
    const exportBlockMatch = moduleContent.match(/export\s*\{\s*([^\}]+)\s*\};?/);
    let exportNames = [];
    if (exportBlockMatch) {
      exportNames = exportBlockMatch[1]
        .split(',')
        .map(s => s.split(' as ').pop().trim())
        .filter(Boolean);
    }

    // Execute the processed content in a context with mocked dependencies
    const vm = require('vm');
    const context = {
      ...global,
      window: global.window,
      document: global.document,
      console: global.console,
// Diagnostic: log context keys after running module
// (Commented out to avoid syntax error in non-Node environments)
// console.log('[DIAG] context keys after runInContext:', Object.keys(context));
      g_sfiahash: global.g_sfiahash,
      g_lorhash: global.g_lorhash,
      lastExportTime: global.lastExportTime,
      initializeLorContent: jest.fn(),
      initializeSFIAContent: jest.fn(),
      renderLorOutput: jest.fn(),
      renderSfiaOutput: jest.fn()
    };
    
    vm.createContext(context);
    vm.runInContext(processedContent, context);

    // Attach exported functions from export { ... } to global, handling "as" renames
    if (exportBlockMatch) {
      exportBlockMatch[1].split(',').forEach(entry => {
        const parts = entry.trim().split(/\s+as\s+/);
        if (parts.length === 2) {
          const [source, target] = parts;
          if (context[source.trim()]) {
            global[target.trim()] = context[source.trim()];
          }
        } else {
          const name = parts[0].trim();
          if (context[name]) {
            global[name] = context[name];
          }
        }
      });
    }
    
    // Copy all new properties back to global scope
    Object.keys(context).forEach(key => {
      if (!global.hasOwnProperty(key) || typeof context[key] === 'function') {
        global[key] = context[key];
      }
    });
    
    return context;
  } catch (error) {
    console.warn(`Failed to load MJS module ${relativePath}:`, error);
    return null;
  }
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.g_sfiahash = '';
  global.g_lorhash = '';
  global.lastExportTime = 0;
  window.location.hash = '';
});
