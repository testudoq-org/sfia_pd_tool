// BOF: src/modules/windowEvents.mjs

// This file contains functions to handle window events, such as 'hashchange' and 'onload'.

// Import constants
import { SELECTED_VERSION } from './constants.mjs';

// Import utility functions
import {
    getCookie,
    setCookie,
    getStoredVersionFromCookie,
    setStoredVersion,
    updateEditorContent,
    formatContentAsQuestions
} from './utilityFunctions.mjs';

// Import URL handling functions
import { updateCombinedUrlHash, parseLorValuesFromHash } from './urlHandling.mjs';

// Import data fetching and initialization functions
import { fetchData } from './dataFetching.mjs';
import {
    initializeContent,
    initializeSFIAContent,
    initializeLorContent,
    initializeCheckboxesAndContent
} from './initializeContent.mjs';

// Import JSON handling functions
import { changeJsonVersion } from './jsonHandling.mjs';

// Import table rendering functions
import { renderSfiaOutput, renderLorOutput } from './tableRendering.mjs';

// Import data handling functions for global variables
import { isSfiaDataLoaded, sfiaDataLoadedPromise } from './dataFetching.mjs';


/**
 * Listens for hash change events and performs the following tasks:
 *  - Retrieves the storedVersion value from a cookie
 *  - If the storedVersion is defined, it fetches the selected version JSON data
 *  - Calls the SelectSfiaCheckboxesAndInitialize function or initializes SFIA content
 *
 * @event hashchange
 */
export const handleHashChange = async () => {
    try {
        const storedVersion = getCookie(SELECTED_VERSION);

        if (storedVersion == null) {
            console.info('hashchange entry: storedVersion is undefined.');
            await initializeContent();
            return;
        }

        const sfiaJson = await fetchData(`${storedVersion}.json`);

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
};

window.addEventListener('hashchange', handleHashChange);

/**
 * Window onload function that is triggered when the page finishes loading.
 * It performs the following tasks:
 *  - Calls the setStoredVersion function to set the stored version
 *  - Parses the URL hash and pre-selects checkboxes
 *  - If there are selected checkboxes, it pre-selects them
 *  - Otherwise, it initializes SFIA content
 */
export const windowOnLoadHandler = async () => {
    console.log('Window onload function triggered');

    try {
        // Call the function to update the URL hash initially
        updateCombinedUrlHash();

        // Get the stored version from the cookie
        const storedVersion = getStoredVersionFromCookie();

        // If the stored version exists, use it. Otherwise, use the default version.
        const selectedVersion = storedVersion ? storedVersion : "json_source_v8";

        // Set the selected version in the dropdown
        document.getElementById("jsonVersionSelect").value = selectedVersion;

        // Load data and initialize content in proper sequence
        await changeJsonVersion();

        // Initialize content after data loading
        await initializeContent();

        const currentURL = window.location.href;
        console.info(`Current URL is: ${currentURL}`);

        if (currentURL.includes('#')) {
            console.log(`Hash exists in URL: ${currentURL}`);
            // Get LoR values from hash
            const lorValues = parseLorValuesFromHash();
            
            if (lorValues.length > 0) {
                console.log('LoR values found in hash:', lorValues);
                // Pre-select checkboxes and render output
                lorValues.forEach(({ lorCategory, lorLevel }) => {
                    const checkbox = document.querySelector(`input[type=checkbox][value="${lorCategory}-${lorLevel}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                const { lorJson: currentLorJson } = await import('./constants.mjs');
                renderLorOutput(currentLorJson, false);
            }
            
            // Handle SFIA hash separately
            const urlHashParts = window.location.hash.substring(1).split("&&");
            console.log('Checking if SFIA data is loaded:', isSfiaDataLoaded);
            if (urlHashParts[0] && urlHashParts[0] !== "" && isSfiaDataLoaded) {
                console.log('SFIA hash found and data is loaded:', urlHashParts[0], isSfiaDataLoaded);
                sfiaDataLoadedPromise.then(async () => {
                    const { sfiaJson: currentSfiaJson } = await import('./constants.mjs');
                    renderSfiaOutput(currentSfiaJson, false);
                });
            }
        } else {
            console.log('No hash in URL');
            window.location.hash = "";
        }

        // Set the stored version
        setStoredVersion("json_source_v8");
    } catch (error) {
        console.error('An error occurred during the onload function:', error.message);
    }
};

window.onload = windowOnLoadHandler;

export const startConversation = () => {
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
                prompt: `Reword the following questions for clarity and provide additional thought-provoking questions with examples where relevant. Only output the questions and examples—no introductions, explanations, or concluding remarks.\n\n${formattedContent}`,
                max_tokens: 1000
            })
        })
        .then(response => response.json())
        .then(data => {
            editor.setValue(`${editor.getValue()}\n\nSFIA Ideas:\n${data.text}`);
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
};

// Initialize Ace editor
let editor;

const initializeAceEditor = () => {
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
};

const setupMenuHandlers = () => {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const saveKeysBtn = document.getElementById('save-keys-btn');

    // Toggle menu visibility
    toggleMenu?.addEventListener('click', () => {
        menuContent?.classList.toggle('hidden');
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
    saveKeysBtn?.addEventListener('click', () => {
        const cohereKey = document.getElementById('cohere-api').value;
        const huggingfaceKey = document.getElementById('huggingface-api').value;
        const selectedApi = document.querySelector('input[name="api-selector"]:checked').value;

        // Save to localStorage (you might want to use more secure storage in production)
        try {
            localStorage.setItem('selectedApi', selectedApi);
            if (cohereKey) localStorage.setItem('cohereApiKey', cohereKey);
            if (huggingfaceKey) localStorage.setItem('huggingfaceApiKey', huggingfaceKey);

            showNotification('API settings saved successfully!', 'success', 3000);
            menuContent?.classList.add('hidden');
        } catch (error) {
            showNotification(`Failed to save API settings: ${error.message}`, 'error', 5000);
        }
    });

    // Initialize menu in hidden state
    if (menuContent) {
        menuContent.classList.add('hidden');
    }
};

const setupApiMenuHandlers = () => {
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
};

export const setupDOMContentLoadedHandler = () => {
    initializeAceEditor();
    setupMenuHandlers();
    setupApiMenuHandlers();
};

document.addEventListener('DOMContentLoaded', setupDOMContentLoadedHandler);

const setupApiKeyManagement = () => {
    const toggleMenuButton = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const cohereApiInput = document.getElementById('cohere-api');
    const huggingfaceApiInput = document.getElementById('huggingface-api');
    const saveKeysBtn = document.getElementById('save-keys-btn');

    // Toggle menu visibility
    if (toggleMenuButton && menuContent) {
        toggleMenuButton.addEventListener('click', () => {
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
    const encryptApiKey = (apiKey) => {
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const encrypted = CryptoJS.AES.encrypt(apiKey, salt).toString();
        return { encrypted, salt };
    };

    // Decryption function
    const decryptApiKey = (encryptedApiKey, salt) => {
        const decrypted = CryptoJS.AES.decrypt(encryptedApiKey, salt).toString(CryptoJS.enc.Utf8);
        return decrypted;
    };

    // Note: getCookie and setCookie are now imported from utilityFunctions.mjs

    // Notification function
    const showNotification = (message, type = 'success') => {
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
    };

    // Remove notification with animation
    const removeNotification = (notification) => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300); // Match this with CSS transition duration
    };

    // Save API keys to cookies with encryption and update UI
    if (saveKeysBtn) {
        saveKeysBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const cohereKey = cohereApiInput.value.trim();
                const huggingfaceKey = huggingfaceApiInput.value.trim();
                const selectedApi = document.querySelector('input[name="api-selector"]:checked')?.value;

                // Save API selection if available
                if (selectedApi) {
                    localStorage.setItem('selectedApi', selectedApi);
                }

                // Save API keys if provided
                if (cohereKey) {
                    const { encrypted: encryptedCohere, salt: saltCohere } = encryptApiKey(cohereKey);
                    setCookie('cohereApi', encryptedCohere, 7, saltCohere);
                }

                if (huggingfaceKey) {
                    const { encrypted: encryptedHuggingface, salt: saltHuggingface } = encryptApiKey(huggingfaceKey);
                    setCookie('huggingfaceApi', encryptedHuggingface, 7, saltHuggingface);
                }

                // Success notification and UI update
                showNotification('API keys encrypted and saved successfully!', 'success', 3000);
                menuContent?.classList.add('hidden');
            } catch (error) {
                showNotification(`Error saving API keys: ${error.message}`, 'error', 5000);
            }
        });
    }

    // Decrypt and show API keys
    const showApiKeys = () => {
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
    };

    // Show API keys on page load
    showApiKeys();
};

document.addEventListener('DOMContentLoaded', setupApiKeyManagement);

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 * @param {number} duration - How long to show the notification in milliseconds
 */
export const showNotification = (message, type = 'success', duration = 5000) => {
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
};

/**
 * Removes a notification with animation
 * @param {HTMLElement} notification - The notification element to remove
 */
export const removeNotification = (notification) => {
    notification.classList.add('fade-out');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300); // Match this with CSS transition duration
};

// Replace clipboard alert with notification
export const copyToClipboard = () => {
    const content = editor.getValue();
    navigator.clipboard.writeText(content).then(() => {
        showNotification('Content copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy content: ', err);
        showNotification('Failed to copy content to clipboard', 'error');
    });
};

// Consolidate all menu-related initialization into a single function
export const initializeMenuHandlers = () => {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const saveKeysBtn = document.getElementById('save-keys-btn');

    if (!toggleMenu || !menuContent) {
        console.error('Menu elements not found');
        return;
    }

    // Toggle menu visibility with animation
    const toggleMenuVisibility = (e) => {
        e.stopPropagation(); // Prevent event from bubbling
        const isHidden = menuContent.classList.contains('hidden');

        // Toggle the hidden class
        menuContent.classList.toggle('hidden');

        // Update ARIA attributes
        toggleMenu.setAttribute('aria-expanded', isHidden);
        menuContent.setAttribute('aria-hidden', !isHidden);

        // Log state for debugging
        console.log('Menu toggled:', isHidden ? 'showing' : 'hiding');
    };

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
    const updateMenuPosition = () => {
        const toggleRect = toggleMenu.getBoundingClientRect();
        menuContent.style.top = `${toggleRect.bottom + window.scrollY}px`;
        menuContent.style.right = '20px'; // Adjust this value as needed
    };

    // Update menu position on toggle and window resize
    toggleMenu.addEventListener('click', updateMenuPosition);
    window.addEventListener('resize', updateMenuPosition);
};

export const initializeEnhancedMenuHandlers = () => {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');

    if (!toggleMenu || !menuContent) {
        console.error('Menu elements not found');
        return;
    }

    const toggleMenuVisibility = (e) => {
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
    };

    const hideMenu = () => {
        menuContent.classList.add('hidden');
        toggleMenu.setAttribute('aria-expanded', 'false');
        menuContent.setAttribute('aria-hidden', 'true');
        console.log('Menu hiding');
    };

    const updateMenuPosition = () => {
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
    };

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
};

// EOF: src/modules/windowEvents.mjs