// src/windowEvents.js

// This file contains functions to handle window events, such as 'hashchange' and 'onload'.

/**
 * Listens for hash change events and performs the following tasks:
 *  - Retrieves the storedVersion value from a cookie
 *  - If the storedVersion is defined, it fetches the selected version JSON data
 *  - Calls the SelectSfiaCheckboxesAndInitialize function or initializes SFIA content
 *
 * @event hashchange
 */
async function handleHashChange() {
    try {
        let storedVersion = getCookie(SELECTED_VERSION);

        if (storedVersion == null) {
            console.info('hashchange entry: storedVersion is undefined.');
            await initializeContent();
            return;
        }

        let sfiaJson = await fetchData(storedVersion + ".json");

        if (sfiaJson) {
            console.log('SFIA content has already been initialized.');
            return;
        }

        console.info('hashchange entry: storedVersion is defined.');
        await initializeCheckboxesAndContent(sfiaJson);
    } catch (error) {
        console.error('An error occurred:', error.message);
        // handle error (retry, show error message, etc.)
    }
}

window.addEventListener('hashchange', handleHashChange);

/**
 * Window onload function that is triggered when the page finishes loading.
 * It performs the following tasks:
 *  - Calls the setStoredVersion function to set the stored version
 *  - Parses the URL hash and pre-selects checkboxes
 *  - If there are selected checkboxes, it pre-selects them
 *  - Otherwise, it initializes SFIA content
 */
window.onload = async function () {
    console.log('Window onload function triggered');

    try {
        // Call the function to update the URL hash initially
        updateCombinedUrlHash();

        // Get the stored version from the cookie
        let storedVersion = getStoredVersionFromCookie();

        // If the stored version exists, use it. Otherwise, use the default version.
        let selectedVersion = storedVersion ? storedVersion : "json_source_v8";

        // Set the selected version in the dropdown
        document.getElementById("jsonVersionSelect").value = selectedVersion;

        // Set the data on table
        await changeJsonVersion();

        // Initialize SFIA content
        await initializeSFIAContent(sfiaJson);
        // Initialize LOR content
        await initializeLorContent(lorJson);

        let currentURL = window.location.href;
        console.info('Current URL is:', currentURL);

        if (currentURL.includes('#')) {
            // Parse URL hash and pre-select checkboxes
            console.log('Hash exists in URL:', currentURL);
            const urlHash = window.location.hash.replace('#', '');
            const selectedCheckboxes = urlHash.split('+');

            // Pre-select checkboxes if needed
            renderSfiaOutput(sfiaJson, false);
            renderLorOutput(lorJson, false);

        } else {
            console.log('Hash does not exist, appending # to URL:', currentURL);
        }

        // Set the stored version
        setStoredVersion("json_source_v8");
    } catch (error) {
        console.error('An error occurred during the onload function:', error.message);
    }
};

// Initialize Ace editor
let editor;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Ace editor
    editor = ace.edit("ace-editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/markdown");
    editor.setOptions({
        fontSize: "12pt",
        wrap: true,
        showPrintMargin: false
    });

    // Set initial content
    updateEditorContent();

    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const saveKeysBtn = document.getElementById('save-keys-btn');

    // Toggle menu visibility
    toggleMenu.addEventListener('click', function() {
        menuContent.classList.toggle('hidden');
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = 'Hide';
            } else {
                input.type = 'password';
                this.textContent = 'Show';
            }
        });
    });

    // Save API keys
    saveKeysBtn.addEventListener('click', function() {
        const cohereKey = document.getElementById('cohere-api').value;
        const huggingfaceKey = document.getElementById('huggingface-api').value;
        const selectedApi = document.querySelector('input[name="api-selector"]:checked').value;

        // Save to localStorage (you might want to use more secure storage in production)
        try {
            localStorage.setItem('selectedApi', selectedApi);
            if (cohereKey) localStorage.setItem('cohereApiKey', cohereKey);
            if (huggingfaceKey) localStorage.setItem('huggingfaceApiKey', huggingfaceKey);

            showNotification('API settings saved successfully!', 'success', 3000);
            menuContent.classList.add('hidden');
        } catch (error) {
            showNotification('Failed to save API settings: ' + error.message, 'error', 5000);
        }
    });

    // Initialize menu in hidden state
    if (menuContent) {
        menuContent.classList.add('hidden');
    }

    // Initialize API menu functionality
    const toggleMenu2 = document.getElementById('toggle-menu');
    const menuContent2 = document.getElementById('menu-content');
    const saveKeysBtn2 = document.getElementById('save-keys-btn');

    // Toggle menu visibility
    toggleMenu2?.addEventListener('click', () => {
        menuContent2?.classList.toggle('hidden');
    });

    // Handle password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    });

    // Handle API key saving
    saveKeysBtn2?.addEventListener('click', (e) => {
        e.preventDefault();
        if (saveApiKeys()) {
            showNotification('API keys saved successfully!', 'success');
            menuContent2?.classList.add('hidden');
        } else {
            showNotification('Failed to save API keys', 'error');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContent2?.contains(e.target) && !toggleMenu2?.contains(e.target)) {
            menuContent2?.classList.add('hidden');
        }
    });
});

/**
 * Updates the Ace editor content with formatted SFIA and LOR content
 */
function updateEditorContent() {
    const sfiaContent = document.getElementById('sfia-output').innerHTML;
    const lorContent = document.getElementById('lor-output').innerHTML;
    
    // Convert HTML content to text and format as questions
    const formattedContent = formatContentAsQuestions(sfiaContent, lorContent);
    
    // Set the formatted content in the Ace editor
    editor.setValue(formattedContent);
    editor.clearSelection();
}

/**
 * Formats the SFIA and LOR content as questions with bullet points
 * @param {string} sfiaContent - HTML content from SFIA editor
 * @param {string} lorContent - HTML content from LOR editor
 * @returns {string} Formatted content with questions and bullet points
 */
function formatContentAsQuestions(sfiaContent, lorContent) {
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

    const formattedContent = formattedHeaders + "\n# Questions to Consider\n\n" + questions.join('\n\n');
    console.log("Formatted content created");
    return formattedContent;
}

/**
 * Copies the Ace editor content to clipboard
 */
function copyToClipboard() {
    const content = editor.getValue();
    navigator.clipboard.writeText(content).then(() => {
        showNotification('Content copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy content: ', err);
        showNotification('Failed to copy content to clipboard', 'error');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const toggleMenuButton = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const cohereApiInput = document.getElementById('cohere-api');
    const huggingfaceApiInput = document.getElementById('huggingface-api');
    const saveKeysBtn = document.getElementById('save-keys-btn');

    // Toggle menu visibility
    if (toggleMenuButton && menuContent) {
        toggleMenuButton.addEventListener('click', function () {
            menuContent.classList.toggle('hidden');
        });
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
            } else {
                targetInput.type = 'password';
            }
        });
    });

    // Encryption function
    function encryptApiKey(apiKey) {
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const encrypted = CryptoJS.AES.encrypt(apiKey, salt).toString();
        return { encrypted: encrypted, salt: salt };
    }

    // Decryption function
    function decryptApiKey(encryptedApiKey, salt) {
        const decrypted = CryptoJS.AES.decrypt(encryptedApiKey, salt).toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    // Cookie setting function
    function setCookie(name, value, days, salt) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
        document.cookie = name + "_salt=" + (salt || "") + expires + "; path=/; SameSite=Strict";
    }

    // Cookie getting function
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Notification function
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Create message text
        const messageText = document.createElement('span');
        messageText.textContent = message;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        // Assemble notification
        notification.appendChild(messageText);
        notification.appendChild(closeButton);
        container.appendChild(notification);
        
        // Handle close button click
        closeButton.addEventListener('click', () => {
            removeNotification(notification);
        });
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                removeNotification(notification);
            }
        }, 5000);
    }

    // Remove notification with animation
    function removeNotification(notification) {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300); // Match this with CSS transition duration
    }

    // Save API keys to cookies with encryption
    if (saveKeysBtn) {
        saveKeysBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cohereKey = cohereApiInput.value.trim();
            const huggingfaceKey = huggingfaceApiInput.value.trim();

            if (cohereKey) {
                const { encrypted: encryptedCohere, salt: saltCohere } = encryptApiKey(cohereKey);
                setCookie('cohereApi', encryptedCohere, 7, saltCohere);
            }

            if (huggingfaceKey) {
                const { encrypted: encryptedHuggingface, salt: saltHuggingface } = encryptApiKey(huggingfaceKey);
                setCookie('huggingfaceApi', encryptedHuggingface, 7, saltHuggingface);
            }

            showNotification('API keys saved securely!', 'success');
        });
    }

    // Decrypt and show API keys
    function showApiKeys() {
        const encryptedCohere = getCookie('cohereApi');
        const saltCohere = getCookie('cohereApi_salt');
        if (encryptedCohere && saltCohere) {
            cohereApiInput.value = decryptApiKey(encryptedCohere, saltCohere);
        }

        const encryptedHuggingface = getCookie('huggingfaceApi');
        const saltHuggingface = getCookie('huggingfaceApi_salt');
        if (encryptedHuggingface && saltHuggingface) {
            huggingfaceApiInput.value = decryptApiKey(encryptedHuggingface, saltHuggingface);
        }
    }

    // Show API keys on page load
    showApiKeys();
});

/**
 * Initialize notification handlers for existing buttons and actions
 */
function initializeNotificationHandlers() {
    // Handle export buttons
    document.getElementById('exportHTML')?.addEventListener('click', () => {
        showNotification('Preparing HTML export...', 'info');
    });

    document.getElementById('exportCSV')?.addEventListener('click', () => {
        showNotification('Preparing CSV export...', 'info');
    });

    // Handle version selection
    document.getElementById('jsonVersionSelect')?.addEventListener('change', () => {
        showNotification('Loading selected SFIA version...', 'info');
    });

    // Handle content saving
    document.querySelectorAll('button[onclick*="save"]').forEach(button => {
        button.addEventListener('click', () => {
            showNotification('Saving content...', 'info');
        });
    });
}
