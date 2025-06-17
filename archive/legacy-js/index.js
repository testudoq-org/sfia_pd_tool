// Main entry point for SFIA Position Description Generator
// This bundles all ES6 modules and legacy JS files

// Import ES6 modules
import * as urlHandling from './modules/urlHandling.mjs';
import * as utilityFunctions from './modules/utilityFunctions.mjs';

// Make ES6 modules available globally for legacy compatibility
window.ES6Modules = {
    urlHandling,
    utilityFunctions
};

// Import and execute legacy JavaScript files in correct order
// Note: These will be concatenated by webpack in the order they appear

// Core initialization
import './constants.js';
import './init.js';
import './initialization.js';

// Data handling
import './dataFetching.js';
import './dataHandling.js';
import './jsonHandling.js';

// UI components
import './checkboxHandling.js';
import './tableRendering.js';
import './exportFunctions.js';
import './theme.js';

// State management
import './sfiaStateManager.js';
import './urlHandling.js';
import './utilityFunctions.js';

// Event handling
import './eventListeners.js';
import './windowEvents.js';
import './browserUpdate.js';

// Content initialization
import './initializeContent.js';

console.log('SFIA Position Description Generator - All modules loaded');
