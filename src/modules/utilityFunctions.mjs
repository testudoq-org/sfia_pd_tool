// Clean ES6 Utility Functions Module for SFIA PD Generator
// Contains enhanced utility functions with performance optimizations

/**
 * Performance utilities for optimizing user interactions
 */
export const PerformanceUtils = {
    /**
     * Debounce function to limit how often a function can be called
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function to limit function execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * DOM utilities for safe element access
 */
export const DOMUtils = {
    /**
     * Safely get element by ID with error handling
     * @param {string} id - Element ID
     * @returns {Object} Result object with success status and element
     */
    safeGetElementById(id) {
        try {
            const element = document.getElementById(id);
            return {
                success: !!element,
                data: element,
                error: element ? null : `Element with ID '${id}' not found`
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: `Error accessing element '${id}': ${error.message}`
            };
        }
    },

    /**
     * Safely query select all with error handling
     * @param {string} selector - CSS selector
     * @returns {Object} Result object with success status and elements
     */
    safeQuerySelectorAll(selector) {
        try {
            const elements = document.querySelectorAll(selector);
            return {
                success: true,
                data: Array.from(elements),
                count: elements.length
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                error: `Error with selector '${selector}': ${error.message}`
            };
        }
    }
};

/**
 * Export management utilities
 */
export const ExportUtils = {
    /**
     * Update the last export time
     * @param {number} timestamp - Optional timestamp (defaults to current time)
     * @returns {Object} Result object with success status
     */
    updateLastExportTime(timestamp = null) {
        try {
            const time = timestamp || new Date().getTime();
            if (typeof window !== 'undefined' && window.global) {
                window.global.lastExportTime = time;
            }
            return {
                success: true,
                data: time
            };
        } catch (error) {
            return {
                success: false,
                error: `Error updating export time: ${error.message}`
            };
        }
    },

    /**
     * Get time until next export is allowed
     * @param {number} timeoutDuration - Timeout duration in milliseconds
     * @param {number} lastExportTime - Last export timestamp
     * @returns {Object} Result object with remaining time
     */
    getTimeUntilNextExport(timeoutDuration, lastExportTime = 0) {
        try {
            const currentTime = new Date().getTime();
            const timeSinceLastExport = currentTime - lastExportTime;
            const remainingTime = Math.max(0, timeoutDuration - timeSinceLastExport);
            
            return {
                success: true,
                data: {
                    remainingTime,
                    canExport: remainingTime === 0,
                    timeSinceLastExport
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Error calculating export time: ${error.message}`,
                data: { remainingTime: 0, canExport: true, timeSinceLastExport: 0 }
            };
        }
    }
};

/**
 * Enhanced validation utilities
 */
export const ValidationUtils = {
    /**
     * Validate input type
     * @param {any} value - Value to validate
     * @param {string} expectedType - Expected type
     * @returns {boolean} True if valid, false otherwise
     */
    validateType(value, expectedType) {
        return typeof value === expectedType;
    },

    /**
     * Validate array input
     * @param {any} value - Value to validate
     * @returns {boolean} True if valid array, false otherwise
     */
    isValidArray(value) {
        return Array.isArray(value);
    },

    /**
     * Validate non-empty string
     * @param {any} value - Value to validate
     * @returns {boolean} True if non-empty string, false otherwise
     */
    isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }
};

/**
 * Check if export should be skipped due to timeout
 * @param {number} timeoutDuration - Timeout duration in milliseconds
 * @param {number} lastExportTime - Last export timestamp (optional)
 * @returns {Object} Result object with success status and skip decision
 */
export function isExportSkippedDueToTimeout(timeoutDuration, lastExportTime = null) {
    try {
        // Input validation
        if (!ValidationUtils.validateType(timeoutDuration, 'number') || timeoutDuration < 0) {
            return {
                success: false,
                error: 'Invalid timeout duration: must be a non-negative number',
                data: false
            };
        }

        // Get last export time from global or parameter
        const effectiveLastExportTime = lastExportTime || 
            (typeof window !== 'undefined' && window.global ? window.global.lastExportTime : 0) || 0;

        const exportTimeResult = ExportUtils.getTimeUntilNextExport(timeoutDuration, effectiveLastExportTime);
        
        if (!exportTimeResult.success) {
            return exportTimeResult;
        }

        return {
            success: true,
            data: !exportTimeResult.data.canExport,
            details: exportTimeResult.data
        };
    } catch (error) {
        return {
            success: false,
            error: `Error checking export timeout: ${error.message}`,
            data: false
        };
    }
}

/**
 * Enhanced search function for text filtering in SFIA table
 * @param {string} inputId - ID of the search input element
 * @param {string} tableBodyId - ID of the table body element
 * @returns {Object} Result object with success status and search details
 */
export function searchForText(inputId = 'myInput', tableBodyId = 'sfia-content') {
    try {
        // Validate inputs
        if (!ValidationUtils.isNonEmptyString(inputId) || !ValidationUtils.isNonEmptyString(tableBodyId)) {
            return {
                success: false,
                error: 'Invalid input: inputId and tableBodyId must be non-empty strings'
            };
        }

        // Get elements safely
        const inputResult = DOMUtils.safeGetElementById(inputId);
        const tableResult = DOMUtils.safeGetElementById(tableBodyId);

        if (!inputResult.success) {
            return {
                success: false,
                error: `Search input not found: ${inputResult.error}`
            };
        }

        if (!tableResult.success) {
            return {
                success: false,
                error: `Table body not found: ${tableResult.error}`
            };
        }

        const input = inputResult.data;
        const tableBody = tableResult.data;
        
        // Get filter value
        const filter = input.value ? input.value.toUpperCase() : '';
        
        // Get all rows
        const rowsResult = DOMUtils.safeQuerySelectorAll(`#${tableBodyId} tr`);
        if (!rowsResult.success) {
            return {
                success: false,
                error: `Error finding table rows: ${rowsResult.error}`
            };
        }

        const rows = rowsResult.data;
        let visibleCount = 0;
        let hiddenCount = 0;

        // Filter rows
        rows.forEach(row => {
            const text = row.textContent || row.innerText || '';
            const shouldShow = text.toUpperCase().includes(filter);
            
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) {
                visibleCount++;
            } else {
                hiddenCount++;
            }
        });

        return {
            success: true,
            data: {
                filter,
                totalRows: rows.length,
                visibleRows: visibleCount,
                hiddenRows: hiddenCount,
                isFiltered: filter.length > 0
            }
        };
    } catch (error) {
        return {
            success: false,
            error: `Error performing search: ${error.message}`
        };
    }
}

/**
 * Legacy compatibility functions
 */

/**
 * Legacy export timeout function for backwards compatibility
 * @param {number} timeoutDuration - Timeout duration
 * @returns {boolean} True if should skip, false otherwise
 */
export function isExportSkippedDueToTimeoutLegacy(timeoutDuration) {
    const result = isExportSkippedDueToTimeout(timeoutDuration);
    return result.success ? result.data : false;
}

/**
 * Legacy search function for backwards compatibility
 * @returns {boolean} True if search was successful, false otherwise
 */
export function searchForTextLegacy() {
    const result = searchForText();
    return result.success;
}

console.log('ES6 Utility Functions Module loaded');
