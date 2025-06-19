/**
 * Application initialization module
 * Handles initial setup and DOM ready state management
 */

/**
 * Initialize instructions collapse state
 * Automatically hides the instructions section on page load
 */
export const initializeInstructionsCollapse = () => {
    const instructionsElement = document.getElementById('instructions');
    if (instructionsElement) {
        // Ensure the element starts in a collapsed state
        instructionsElement.classList.add('collapsed');
        instructionsElement.classList.remove('show');
        
        // Initialize Bootstrap collapse with proper options
        const collapse = new bootstrap.Collapse(instructionsElement, {
            toggle: false,  // Don't auto-toggle on initialization
            show: false     // Start hidden
        });
        
        // Ensure it's properly hidden
        collapse.hide();
    }
};

/**
 * Main initialization function
 * Sets up the application when DOM is ready
 */
export const initializeApplication = () => {
    // Initialize instructions collapse state
    initializeInstructionsCollapse();
};

/**
 * DOM ready state handler
 * Ensures initialization occurs when DOM is fully loaded
 */
const handleDOMReady = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApplication);
    } else {
        initializeApplication();
    }
};

// Auto-initialize when module is imported
handleDOMReady();