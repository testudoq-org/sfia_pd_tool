// BOF: src/modules/app.mjs

/**
 * Application Entry Point
 * This is the main entry point for the SFIA application when using ES6 modules.
 * It imports all necessary functions from other modules and orchestrates the 
 * application initialization sequence.
 */

// Import all necessary functions from modules
import { initializeTheme, toggleTheme } from './theme.mjs';
import { initializeApplication, initializeInstructionsCollapse } from './init.mjs';
import { 
    handleHashChange, 
    windowOnLoadHandler, 
    startConversation, 
    copyToClipboard, 
    initializeMenuHandlers,
    showNotification 
} from './windowEvents.mjs';
import { setupEventListeners } from './eventListeners.mjs';
import { changeJsonVersion } from './jsonHandling.mjs';
import { exportCSV, exportHTML, saveSfiaContent, saveLorContent } from './exportFunctions.mjs';

// Import utility and data handling functions
import { fetchData } from './dataFetching.mjs';
import { initializeContent, initializeSFIAContent, initializeLorContent } from './initializeContent.mjs';
import { renderSfiaOutput, renderLorOutput } from './tableRendering.mjs';
import { getCookie, setCookie, getStoredVersionFromCookie, setStoredVersionToCookie, searchForText, updateEditorContent } from './utilityFunctions.mjs';
import { updateCombinedUrlHash, parseLorValuesFromHash } from './urlHandling.mjs';

// Make changeJsonVersion globally accessible for HTML onchange attribute
window.changeJsonVersion = changeJsonVersion;

// Make other functions globally accessible that may be called from HTML
window.toggleTheme = toggleTheme;
window.startConversation = startConversation;
window.copyToClipboard = copyToClipboard;
window.exportCSV = exportCSV;
window.exportHTML = exportHTML;
window.saveSfiaContent = saveSfiaContent;
window.saveLorContent = saveLorContent;
window.searchForText = searchForText;
window.updateEditorContent = updateEditorContent;
window.setStoredVersionToCookie = setStoredVersionToCookie;

/**
 * Clear all SFIA and LoR checkbox selections and update the UI.
 */
window.clearAllSelections = () => {
    document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]:checked')
        .forEach(cb => { cb.checked = false; });
    document.querySelectorAll('input[type=checkbox][id^="lor-"]:checked')
        .forEach(cb => { cb.checked = false; });
    // Re-render outputs and URL
    import('./constants.mjs').then(({ sfiaJson: currentSfiaJson }) => {
        renderSfiaOutput(currentSfiaJson);
    });
    import('./tableRendering.mjs').then(({ renderLorOutput: rlo }) => {
        import('./constants.mjs').then(({ lorJson: currentLorJson }) => {
            rlo(currentLorJson);
        });
    });
    updateSelectionCount();
};

/**
 * Update the selection count badge in the toolbar.
 * Counts both SFIA skill and LoR checkbox selections.
 */
const updateSelectionCount = () => {
    const sfiaCount = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]:checked').length;
    const lorCount = document.querySelectorAll('input[type=checkbox][id^="lor-"]:checked').length;
    const totalCount = sfiaCount + lorCount;
    const badge = document.getElementById('selection-count');
    if (badge) {
        badge.textContent = totalCount === 0 ? '0 selected' : `${sfiaCount} skill${sfiaCount !== 1 ? 's' : ''}, ${lorCount} LoR`;
        badge.classList.toggle('bg-primary', totalCount === 0);
        badge.classList.toggle('bg-success', totalCount > 0);
    }
};
window._updateSelectionCount = updateSelectionCount;

/**
 * Main application initialization function
 * Called when the DOM is fully loaded
 */
const initializeApp = async () => {
    console.log('Initializing SFIA application...');
    
    try {
        // 1. Initialize theme first (visual setup)
        initializeTheme();
        
        // 2. Initialize main application components
        initializeApplication();
        initializeInstructionsCollapse();
        
        // 3. Set up menu handlers
        initializeMenuHandlers();
        
        // 4. Handle initial data load and URL hash processing
        await windowOnLoadHandler();
        
        // 5. Set up hash change listener for navigation
        window.addEventListener('hashchange', handleHashChange);
        
        console.log('SFIA application initialization complete.');
        
    } catch (error) {
        console.error('Error during application initialization:', error);
        // Show user-friendly error notification if available
        if (typeof showNotification === 'function') {
            showNotification('Application initialization failed. Please refresh the page.', 'error');
        }
    }
};

/**
 * DOM Content Loaded Event Listener
 * Ensures the application initializes when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Fallback initialization for cases where DOMContentLoaded has already fired
 */
if (document.readyState === 'loading') {
    // DOM is still loading, event listener will handle initialization
} else {
    // DOM is already loaded, initialize immediately
    initializeApp();
}

// EOF: src/modules/app.mjs