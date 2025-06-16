// src/modules/utilityFunctions.mjs
/**
 * ES6 Module for utility functions
 * Modernized version of src/utilityFunctions.js
 */

/**
 * Checks if the last export was within the specified timeout duration.
 *
 * @param {number} timeoutDuration - The timeout duration in milliseconds.
 * @param {number} lastExportTime - The last export timestamp (defaults to global)
 * @return {boolean} True if the last export was within the timeout duration, false otherwise.
 */
export function isExportSkippedDueToTimeout(timeoutDuration, lastExportTime = global.lastExportTime || 0) {
    const currentTime = new Date().getTime();
    const timeSinceLastExport = currentTime - lastExportTime;
    return timeSinceLastExport < timeoutDuration;
}

/**
 * Function to search for text in the SFIA table and show/hide rows based on the filter.
 * @param {string} inputId - ID of the search input element (default: 'myInput')
 * @param {string} tableBodyId - ID of the table body element (default: 'sfia-content')
 * @returns {Object} Result object with success status and message
 */
export function searchForText(inputId = 'myInput', tableBodyId = 'sfia-content') {
    try {
        // Get user input and filter value
        const input = document.getElementById(inputId);
        if (!input) {
            const message = `Input element '${inputId}' not found.`;
            console.error(message);
            return { success: false, message };
        }
        
        const filterValue = input.value.toUpperCase();

        // Get table body and rows
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) {
            const message = `Table body element '${tableBodyId}' not found.`;
            console.error(message);
            return { success: false, message };
        }
        
        const tableRows = tableBody.getElementsByTagName('tr');
        if (!tableRows || tableRows.length === 0) {
            const message = "No table rows found.";
            console.error(message);
            return { success: false, message };
        }

        let visibleCount = 0;
        let processedCount = 0;

        // Loop through rows and show/hide based on filter
        for (let i = 0; i < tableRows.length; i++) {
            const skillKey = tableRows[i].getElementsByClassName("skill_key")[0];
            if (!skillKey) {
                console.error(`Skill key element not found for row ${i}.`);
                continue;
            }
            
            const skillText = skillKey.textContent;
            const isVisible = skillText.toUpperCase().includes(filterValue);
            
            tableRows[i].style.display = isVisible ? '' : 'none';
            
            if (isVisible) visibleCount++;
            processedCount++;
        }

        return {
            success: true,
            message: `Search completed. ${visibleCount} of ${processedCount} rows visible.`,
            visibleCount,
            processedCount,
            filterValue
        };

    } catch (error) {
        const message = `Search function error: ${error.message}`;
        console.error(message);
        return { success: false, message, error };
    }
}

/**
 * Validates if a given element exists in the DOM
 * @param {string} elementId - The ID of the element to check
 * @returns {boolean} True if element exists, false otherwise
 */
export function validateElement(elementId) {
    return document.getElementById(elementId) !== null;
}

/**
 * Safe getter for DOM elements with error handling
 * @param {string} elementId - The ID of the element to get
 * @returns {HTMLElement|null} The element if found, null otherwise
 */
export function safeGetElement(elementId) {
    try {
        return document.getElementById(elementId);
    } catch (error) {
        console.error(`Error getting element '${elementId}':`, error);
        return null;
    }
}

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
