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
        // Use Bootstrap's collapse functionality to hide instructions
        const collapse = new bootstrap.Collapse(instructionsElement, {
            show: false
        });
        instructionsElement.classList.add('collapsed');
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