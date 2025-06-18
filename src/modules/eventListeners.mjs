// BOF: src/modules/eventListeners.mjs

// This file contains functions to set up event listeners for the SFIA application.

/**
 * Sets up event listeners for SFIA data interaction
 * @param {Object} sfiaJson - The SFIA JSON data
 */
export const setupEventListeners = (sfiaJson) => {
    console.log('Setting up event listeners for SFIA data:', sfiaJson);
    
    // Add event listeners for SFIA checkboxes
    const sfiacheckboxes = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]');
    sfiacheckboxes.forEach((checkbox) => {
        // Remove existing listeners to prevent duplicates
        checkbox.removeEventListener('click', handleSfiaCheckboxChange);
        
        // Add new listener
        checkbox.addEventListener('click', () => handleSfiaCheckboxChange(sfiaJson), false);
    });
    
    // Add event listeners for LOR checkboxes
    const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');
    lorCheckboxes.forEach((checkbox) => {
        // Remove existing listeners to prevent duplicates
        checkbox.removeEventListener('click', handleLorCheckboxChange);
        
        // Add new listener
        checkbox.addEventListener('click', handleLorCheckboxChange, false);
    });
    
    console.log(`Set up listeners for ${sfiacheckboxes.length} SFIA checkboxes and ${lorCheckboxes.length} LOR checkboxes`);
};

/**
 * Handles SFIA checkbox change events
 * @param {Object} sfiaJson - The SFIA JSON data
 */
const handleSfiaCheckboxChange = async (sfiaJson) => {
    try {
        console.log('SFIA checkbox changed');
        const { renderSfiaOutput } = await import('./tableRendering.mjs');
        renderSfiaOutput(sfiaJson);
        
        const { updateSfiaHashFromCheckboxes, updateCombinedUrlHash } = await import('./urlHandling.mjs');
        updateSfiaHashFromCheckboxes();
        updateCombinedUrlHash();
    } catch (error) {
        console.error('Error handling SFIA checkbox change:', error);
    }
};

/**
 * Handles LOR checkbox change events
 */
const handleLorCheckboxChange = async () => {
    try {
        console.log('LOR checkbox changed');
        const { renderLorOutput } = await import('./tableRendering.mjs');
        const { lorJson } = await import('./constants.mjs');
        renderLorOutput(lorJson);
        
        const { updateURLWithLorCheckboxes } = await import('./urlHandling.mjs');
        updateURLWithLorCheckboxes();
    } catch (error) {
        console.error('Error handling LOR checkbox change:', error);
    }
};

// EOF: src/modules/eventListeners.mjs