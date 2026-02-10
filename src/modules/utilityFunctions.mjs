// BOF: src/modules/utilityFunctions.mjs
// This file includes utility functions, such as checking if the last export was within a specified timeout duration and searching for text in the SFIA table.

import { lastExportTime } from './constants.mjs';

/**
 * Creates a debounced version of a function that delays invocation
 * until after `delay` milliseconds have passed since the last call.
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function} Debounced function.
 */
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Enhanced hyperlink creation from nested JSON data.
 * - Modern JS, robust error handling, accessibility, security, and configurability.
 * @param {Object} jsonData - Root JSON object.
 * @param {string[]} keyPath - Path to target object [category, subcategory, skill].
 * @param {HTMLElement} parentElement - Container element to append to.
 * @param {Object} options - Configuration options.
 * @returns {HTMLAnchorElement|HTMLSpanElement|null} Created element or null.
 */
export function createEnhancedHyperlink(jsonData, keyPath, parentElement, options = {}) {
    const defaultOptions = {
        urlProperty: 'url',
        textProperties: ['code', 'title', 'name', 'description'],
        target: '_blank',
        rel: 'noopener noreferrer',
        cssClasses: ['sfia-link'],
        ariaLabel: null,
        tooltip: true,
        fallbackElement: 'span',
        onError: null,
        onClick: null,
        validateUrl: true
    };
    const config = { ...defaultOptions, ...options };

    try {
        // Validate input types
        if (typeof jsonData !== 'object' || !Array.isArray(keyPath) || !(parentElement instanceof HTMLElement)) {
            throw new TypeError('[createEnhancedHyperlink] Invalid arguments.');
        }

        // Traverse JSON by keyPath
        let target = jsonData;
        for (const key of keyPath) {
            if (target && Object.prototype.hasOwnProperty.call(target, key)) {
                target = target[key];
            } else {
                throw new Error(`[createEnhancedHyperlink] Key '${key}' not found in path: ${keyPath.join(' > ')}`);
            }
        }
        if (!target || typeof target !== 'object') {
            throw new Error('[createEnhancedHyperlink] Target object not found or invalid.');
        }

        // Get URL and display text
        const url = target[config.urlProperty];
        let displayText = '';
        for (const prop of config.textProperties) {
            if (typeof target[prop] === 'string' && target[prop].trim().length > 0) {
                displayText = target[prop].trim();
                break;
            }
        }
        if (!displayText) displayText = '(No label)';

        // Validate URL (basic check)
        const isValidUrl = config.validateUrl &&
            typeof url === 'string' &&
            /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url.trim());

        // Accessibility: ARIA label
        let ariaLabel = config.ariaLabel;
        if (!ariaLabel) {
            ariaLabel = displayText;
            if (target.description && typeof target.description === 'string') {
                ariaLabel += `: ${target.description.trim()}`;
            }
        }

        // Tooltip text (prefer description)
        const tooltipText = config.tooltip && target.description
            ? target.description.trim()
            : '';

        // Create element
        let el;
        if (isValidUrl) {
            el = document.createElement('a');
            el.href = url.trim();
            el.target = config.target;
            el.rel = config.rel;
            el.textContent = displayText;
            el.setAttribute('aria-label', ariaLabel);
            if (tooltipText) {
                el.setAttribute('title', tooltipText);
                el.setAttribute('data-bs-toggle', 'tooltip');
            }
            if (Array.isArray(config.cssClasses)) {
                el.classList.add(...config.cssClasses);
            }
            // Keyboard focus
            el.tabIndex = 0;
            // Optional click handler
            if (typeof config.onClick === 'function') {
                el.addEventListener('click', config.onClick);
            }
        } else {
            // Fallback: <span>
            el = document.createElement(config.fallbackElement);
            el.textContent = displayText;
            el.setAttribute('aria-label', ariaLabel);
            if (tooltipText) {
                el.setAttribute('title', tooltipText);
                el.setAttribute('data-bs-toggle', 'tooltip');
            }
            if (Array.isArray(config.cssClasses)) {
                el.classList.add(...config.cssClasses, 'sfia-link-fallback');
            }
            el.tabIndex = 0;
        }

        // Security: prevent XSS by not injecting HTML, only textContent
        parentElement.appendChild(el);

        // Bootstrap tooltip integration (if present)
        if (tooltipText && typeof window.bootstrap !== 'undefined' && window.bootstrap.Tooltip) {
            try {
                new window.bootstrap.Tooltip(el);
            } catch (e) {
                // Ignore tooltip errors
            }
        }

        return el;
    } catch (err) {
        // Error handling
        if (typeof options.onError === 'function') {
            options.onError(err, { jsonData, keyPath, parentElement, options });
        } else {
            console.error('[createEnhancedHyperlink] Error:', err);
        }
        return null;
    }
}

/**
 * Checks if the last export was within the specified timeout duration.
 *
 * @param {number} timeoutDuration - The timeout duration in milliseconds.
 * @return {boolean} True if the last export was within the timeout duration, false otherwise.
 */
export function isExportSkippedDueToTimeout(timeoutDuration) {
    const currentTime = new Date().getTime();
    const timeSinceLastExport = currentTime - lastExportTime;
    return timeSinceLastExport < timeoutDuration;
}

/**
 * Function to search for text in the SFIA table and show/hide rows based on the filter.
 */
/**
 * Core search logic — filters the SFIA table rows by the current input value.
 * Separated from the debounced wrapper so it can be tested / called directly.
 */
export function _searchForTextImmediate() {
    try {
        const input = document.getElementById('myInput');
        if (!input) {
            console.error("Input element not found.");
            return;
        }
        const filterValue = input.value.toUpperCase();

        const tableBody = document.getElementById("sfia-content");
        if (!tableBody) {
            console.error("Table body element not found.");
            return;
        }
        const tableRows = tableBody.getElementsByTagName('tr');
        if (!tableRows || tableRows.length === 0) {
            console.error("No table rows found.");
            return;
        }

        for (let i = 0; i < tableRows.length; i++) {
            const skillKey = tableRows[i].querySelector(".skill_key");
            if (!skillKey) {
                console.error(`Skill key element not found for row ${i}.`);
                continue;
            }
            const skillText = skillKey.textContent || skillKey.innerText || '';

            if (filterValue === '' || skillText.toUpperCase().includes(filterValue)) {
                tableRows[i].style.display = "";
            } else {
                tableRows[i].style.display = "none";
            }
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

/**
 * Debounced search handler — waits 250 ms after the last keystroke before filtering.
 * Falls back to the immediate version in test environments where timers may not fire.
 */
export const searchForText = (() => {
    const debouncedSearch = debounce(_searchForTextImmediate, 250);
    return () => {
        debouncedSearch();
    };
})();

/**
 * Updates the Ace editor content with formatted SFIA and LOR content
 */
export function updateEditorContent() {
    const sfiaOutputElement = document.getElementById('sfia-output');
    const lorOutputElement = document.getElementById('lor-output');
    
    const sfiaContent = sfiaOutputElement ? sfiaOutputElement.innerHTML : '';
    const lorContent = lorOutputElement ? lorOutputElement.innerHTML : '';
    
    // Convert HTML content to text and format as questions
    const formattedContent = formatContentAsQuestions(sfiaContent, lorContent);
    
    // Check if editor is available before trying to use it
    if (typeof editor !== 'undefined' && editor) {
        editor.setValue(formattedContent);
        editor.clearSelection();
    } else {
        // Try to access global editor via window
        if (typeof window !== 'undefined' && window.editor) {
            window.editor.setValue(formattedContent);
            window.editor.clearSelection();
        } else {
            console.error('[ERROR] Ace editor not available for updateEditorContent()');
        }
    }
}

/**
 * Formats the SFIA and LOR content as questions with bullet points
 * @param {string} sfiaContent - HTML content from SFIA editor
 * @param {string} lorContent - HTML content from LOR editor
 * @returns {string} Formatted content with questions and bullet points
 */
export function formatContentAsQuestions(sfiaContent, lorContent) {
    console.log("Starting formatContentAsQuestions function");

    // Extract headers and organize them hierarchically
    const headerRegex = /<h([1-6])>([^<]+)<\/h\1>/g;
    const headers = {
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
    };

    // Process SFIA headers
    let sfiaMatch;
    while ((sfiaMatch = headerRegex.exec(sfiaContent)) !== null) {
        const level = sfiaMatch[1];
        const text = sfiaMatch[2].trim();
        headers[`h${level}`].push(text);
    }

    // Process LOR headers
    let lorMatch;
    while ((lorMatch = headerRegex.exec(lorContent)) !== null) {
        const level = lorMatch[1];
        const text = lorMatch[2].trim();
        headers[`h${level}`].push(text);
    }

    // Create the headers section
    let formattedHeaders = "# SFIA Skills and Responsibilities Summary\n\n";
    
    // Add each level of headers with appropriate markdown heading level
    Object.entries(headers).forEach(([level, items]) => {
        if (items.length > 0) {
            const markdownLevel = '#'.repeat(parseInt(level[1]));
            items.forEach(item => {
                formattedHeaders += `${markdownLevel} ${item}\n\n`;
            });
        }
    });

    // Helper function to remove header tags and their content
    const withoutHeaders = str => str.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g, '');
    // Remove any remaining HTML tags
    const stripHtml = str => str.replace(/<[^>]*>/g, '');
    
    // Combine content, strip out headers and HTML tags
    const cleanedContent = stripHtml(withoutHeaders([sfiaContent, lorContent].join('\n')));
    
    // Split the cleaned content into sentences (using newlines) and filter empty lines
    const sentences = cleanedContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Convert each sentence into a question
    const questions = sentences
        .filter(sentence => sentence.length > 10) // Filter out very short sentences
        .map(sentence => {
            sentence = sentence.replace(/[.?]+$/, '');
            const variations = [
                `* How would you demonstrate your ability to ${sentence.toLowerCase()}?`,
                `* Can you give an example of how you would ${sentence.toLowerCase()}?`,
                `* How do you think you would ${sentence.toLowerCase()}?`,
                `* Can you describe how you would ${sentence.toLowerCase()}?`,
                `* How would you approach ${sentence.toLowerCase()}?`,
            ];
            return variations[Math.floor(Math.random() * variations.length)];
        });

    const formattedContent = `${formattedHeaders}\n# Questions to Consider\n\n${questions.join('\n\n')}`;
    console.log("Formatted content created");
    return formattedContent;
}

/**
 * Copies the Ace editor content to clipboard
 */
export function copyToClipboard() {
    const content = editor.getValue();
    navigator.clipboard.writeText(content).then(() => {
        alert('Content copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy content: ', err);
        alert('Failed to copy content to clipboard');
    });
}

/**
 * Save the content of the specified type (SFIA or LOR) to the corresponding editor.
 * @param {string} type - The type of content to save ('sfia' or 'lor').
 */
export function saveContent(type) {
    if (type === 'sfia') {
        const sfiaContent = $('#sfia-output').html();
        $('#sfia-editor').val(sfiaContent);
    } else if (type === 'lor') {
        const lorContent = $('#lor-output').html();
        $('#lor-editor').val(lorContent);
    }
}

/**
 * Set a cookie with the given name, value, and expiration days
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 * @param {string} salt - Salt for encryption (optional)
 */
export function setCookie(name, value, days, salt = '') {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    if (salt) {
        document.cookie = `${name}_salt=${salt}; expires=${expires.toUTCString()}; path=/`;
    }
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Get the stored version from cookie
 * @returns {string|null} Stored version or null if not found
 */
export function getStoredVersionFromCookie() {
    return getCookie('selectedVersion') || getCookie('storedVersion');
}

/**
 * Set the stored version in cookie
 * @param {string} version - Version to store
 */
export function setStoredVersion(version) {
    setCookie('selectedVersion', version, 30); // Store for 30 days
}

/**
 * Set the stored version to cookie (alias for compatibility)
 * @param {string} version - Version to store
 */
export function setStoredVersionToCookie(version) {
    setStoredVersion(version);
}

// EOF: src/modules/utilityFunctions.mjs
