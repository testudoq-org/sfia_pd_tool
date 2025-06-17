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
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.g_sfiahash = '';
  global.g_lorhash = '';
  global.lastExportTime = 0;
  window.location.hash = '';
});
