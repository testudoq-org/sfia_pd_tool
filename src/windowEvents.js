// BOF: src/windowEvents.js

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

function startConversation() {
    const selectedApi = localStorage.getItem('selectedApi');
    const cohereApiKey = localStorage.getItem('cohereApiKey');
    const huggingfaceApiKey = localStorage.getItem('huggingfaceApiKey');
    const sfiaContent = document.getElementById('sfia-output').innerHTML;
    const lorContent = document.getElementById('lor-output').innerHTML;
    const formattedContent = formatContentAsQuestions(sfiaContent, lorContent);

    const startButton = document.querySelector('button[onclick="startConversation()"]');
    startButton.disabled = true;
    startButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Communicating...';

    if (selectedApi === 'cohere' && cohereApiKey) {
        fetch('https://api.cohere.ai/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cohereApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: formattedContent,
                max_tokens: 100
            })
        })
        .then(response => response.json())
        .then(data => {
            editor.setValue(editor.getValue() + "\n\nSFIA Ideas:\n" + data.text);
            startButton.disabled = false;
            startButton.innerHTML = 'Start AI Conversation';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to communicate with Cohere API');
            startButton.disabled = false;
            startButton.innerHTML = 'Start AI Conversation';
        });
    } else if (selectedApi === 'huggingface' && huggingfaceApiKey) {
        fetch('https://api-inference.huggingface.co/models/your-model', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${huggingfaceApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: editorContent
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(`SFIA Ideas: ${data.generated_text}`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to communicate with Hugging Face API');
        });
    } else {
        alert('API key not found or API not selected');
    }
}

// Initialize Ace editor
let editor;

document.addEventListener('DOMContentLoaded', function () {
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
    toggleMenu.addEventListener('click', function () {
        menuContent.classList.toggle('hidden');
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
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
    saveKeysBtn.addEventListener('click', function () {
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
        button.addEventListener('click', function () {
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

// API Key Management code
const API_KEY_CONFIG = {

};

// Handle API key saving in the encrypted version
saveKeysBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    try {
        if (saveApiKeys()) {
            showNotification('API keys encrypted and saved successfully!', 'success', 3000);
            menuContent?.classList.add('hidden');
        } else {
            showNotification('Failed to save API keys', 'error', 5000);
        }
    } catch (error) {
        showNotification('Error saving API keys: ' + error.message, 'error', 5000);
    }
});

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showNotification(message, type = 'success', duration = 5000) {
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
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                removeNotification(notification);
            }
        }, duration);
    }
}

/**
 * Removes a notification with animation
 * @param {HTMLElement} notification - The notification element to remove
 */
function removeNotification(notification) {
    notification.classList.add('fade-out');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300); // Match this with CSS transition duration
}

// Replace all alert() calls with showNotification()
// Example of usage in save API keys:
saveKeysBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (saveApiKeys()) {
        showNotification('API keys saved successfully!', 'success');
        menuContent?.classList.add('hidden');
    } else {
        showNotification('Failed to save API keys', 'error');
    }
});

// Replace clipboard alert with notification
function copyToClipboard() {
    const content = editor.getValue();
    navigator.clipboard.writeText(content).then(() => {
        showNotification('Content copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy content: ', err);
        showNotification('Failed to copy content to clipboard', 'error');
    });
}

// Consolidate all menu-related initialization into a single function
function initializeMenuHandlers() {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const saveKeysBtn = document.getElementById('save-keys-btn');

    if (!toggleMenu || !menuContent) {
        console.error('Menu elements not found');
        return;
    }

    // Toggle menu visibility with animation
    function toggleMenuVisibility(e) {
        e.stopPropagation(); // Prevent event from bubbling
        const isHidden = menuContent.classList.contains('hidden');

        // Toggle the hidden class
        menuContent.classList.toggle('hidden');

        // Update ARIA attributes
        toggleMenu.setAttribute('aria-expanded', isHidden);
        menuContent.setAttribute('aria-hidden', !isHidden);

        // Log state for debugging
        console.log('Menu toggled:', isHidden ? 'showing' : 'hiding');
    }

    // Remove any existing event listeners
    toggleMenu.removeEventListener('click', toggleMenuVisibility);

    // Add fresh event listener
    toggleMenu.addEventListener('click', toggleMenuVisibility);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContent?.contains(e.target) && !toggleMenu?.contains(e.target)) {
            menuContent?.classList.add('hidden');
            toggleMenu.setAttribute('aria-expanded', 'false');
            menuContent.setAttribute('aria-hidden', 'true');
        }
    });

    // Initialize menu state
    menuContent.classList.add('hidden');
    toggleMenu.setAttribute('aria-expanded', 'false');
    menuContent.setAttribute('aria-hidden', 'true');

    // Initialize menu position
    function updateMenuPosition() {
        const toggleRect = toggleMenu.getBoundingClientRect();
        menuContent.style.top = `${toggleRect.bottom + window.scrollY}px`;
        menuContent.style.right = '20px'; // Adjust this value as needed
    }

    // Update menu position on toggle and window resize
    toggleMenu.addEventListener('click', updateMenuPosition);
    window.addEventListener('resize', updateMenuPosition);

}


function initializeMenuHandlers() {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');

    if (!toggleMenu || !menuContent) {
        console.error('Menu elements not found');
        return;
    }

    function toggleMenuVisibility(e) {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyHidden = menuContent.classList.contains('hidden');
        console.log('Current menu state:', isCurrentlyHidden ? 'hidden' : 'visible');

        if (isCurrentlyHidden) {
            menuContent.classList.remove('hidden');
            toggleMenu.setAttribute('aria-expanded', 'true');
            menuContent.setAttribute('aria-hidden', 'false');
            updateMenuPosition();
            console.log('Menu showing');
        } else {
            hideMenu();
        }
    }

    function hideMenu() {
        menuContent.classList.add('hidden');
        toggleMenu.setAttribute('aria-expanded', 'false');
        menuContent.setAttribute('aria-hidden', 'true');
        console.log('Menu hiding');
    }


    function updateMenuPosition() {



        const toggleRect = toggleMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const menuWidth = menuContent.offsetWidth;

        // Calculate right position to ensure menu stays within viewport
        let rightPosition = windowWidth - toggleRect.right;
        if (rightPosition + menuWidth > windowWidth) {
            rightPosition = 10; // 10px from right if menu would overflow
        }

        menuContent.style.top = `${toggleRect.bottom + 5}px`; // 5px gap
        menuContent.style.right = `${rightPosition}px`;
    }

    // Clean up existing listeners
    toggleMenu.removeEventListener('click', toggleMenuVisibility);

    // Set up new listeners
    toggleMenu.addEventListener('click', toggleMenuVisibility);




    // Handle clicks outside the menu
    document.addEventListener('click', (e) => {
        if (!menuContent.contains(e.target) && !toggleMenu.contains(e.target)) {
            hideMenu();
        }
    });

    // Update position on window resize
    window.addEventListener('resize', () => {
        if (!menuContent.classList.contains('hidden')) {
            updateMenuPosition();
        }
    });

    // Ensure menu starts hidden
    hideMenu();
    
}

// EOF: src/windowEvents.js
