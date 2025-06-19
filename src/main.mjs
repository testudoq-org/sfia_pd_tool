// src/main.mjs

// Import CSS files
import './styles.css';

// Import all modules
import * as app from './modules/app.mjs';
import * as browserUpdate from './modules/browserUpdate.mjs';
import * as checkboxHandling from './modules/checkboxHandling.mjs';
import * as constants from './modules/constants.mjs';
import * as dataFetching from './modules/dataFetching.mjs';
import * as dataHandling from './modules/dataHandling.mjs';
import * as eventListeners from './modules/eventListeners.mjs';
import * as exportFunctions from './modules/exportFunctions.mjs';
import * as init from './modules/init.mjs';
import * as initializeContent from './modules/initializeContent.mjs';
import * as jsonHandling from './modules/jsonHandling.mjs';
import * as tableRendering from './modules/tableRendering.mjs';
import * as theme from './modules/theme.mjs';
import * as urlHandling from './modules/urlHandling.mjs';
import * as utilityFunctions from './modules/utilityFunctions.mjs';
import * as windowEvents from './modules/windowEvents.mjs';

// Expose necessary functions to the window object for legacy compatibility
window.app = app;
window.browserUpdate = browserUpdate;
window.checkboxHandling = checkboxHandling;
window.constants = constants;
window.dataFetching = dataFetching;
window.dataHandling = dataHandling;
window.eventListeners = eventListeners;
window.exportFunctions = exportFunctions;
window.init = init;
window.initializeContent = initializeContent;
window.jsonHandling = jsonHandling;
window.tableRendering = tableRendering;
window.theme = theme;
window.urlHandling = urlHandling;
window.utilityFunctions = utilityFunctions;
window.windowEvents = windowEvents;

// Expose specific export functions that are likely called from HTML
window.exportCSV = exportFunctions.exportCSV;
window.exportHTML = exportFunctions.exportHTML;
window.saveSfiaContent = exportFunctions.saveSfiaContent;
window.saveLorContent = exportFunctions.saveLorContent;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    init.initializePage();
});