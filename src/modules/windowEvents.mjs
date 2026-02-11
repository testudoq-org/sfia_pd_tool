/* eslint-env browser */
/* global console, window, document, localStorage, alert, fetch, ace, setTimeout, navigator */
// BOF: src/modules/windowEvents.mjs

// This file contains functions to handle window events, such as 'hashchange' and 'onload'.

// Import constants
import { SELECTED_VERSION } from './constants.mjs';

// Import utility functions
import {
    getCookie,
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

    // Guard against empty or insufficient content to avoid 400 from Cohere
    if (!formattedContent || formattedContent.trim().length < 10) {
        console.warn('[AI] Aborting startConversation: formatted content is empty or too short');
        showNotification('Please select at least one SFIA skill or LOR before starting the AI conversation.', 'error', 5000);
        startButton.disabled = false;
        startButton.innerHTML = 'Start AI Conversation';
        return;
    }



    if (selectedApi === 'cohere' && cohereApiKey) {
        // Use Cohere Chat API via simple fetch. Keep it minimal and parse multiple possible response shapes.
        sendCohereChatRequest(cohereApiKey, formattedContent)
        .then(assistantText => {
            editor.setValue(`${editor.getValue()}\n\nSFIA Ideas:\n${assistantText}`);
            startButton.disabled = false;
            startButton.innerHTML = 'Start AI Conversation';
        })
        .catch(error => {
            console.error('Error:', error);
            // Surface the underlying error message to the user for better diagnostics
            alert(`Failed to communicate with Cohere API: ${error.message || 'Unknown error'}`);
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
                inputs: formattedContent
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

// Import Cohere chat helper
import { sendCohereChatRequest } from './cohereChat.mjs';

// Initialize Ace editor
/* eslint-disable-next-line no-unused-vars */
let editor;

const initializeAceEditor = () => {
    const editorElement = document.getElementById("ace-editor");
    
    if (!editorElement) {
        console.error('[ERROR] ace-editor element not found during initialization!');
        return;
    }
    
    // Initialize Ace editor
    editor = ace.edit("ace-editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/markdown");
    editor.setOptions({
        fontSize: "12pt",
        wrap: true,
        showPrintMargin: false
    });

    // Make editor globally accessible - CRITICAL FIX for updateEditorContent()
    window.editor = editor;

    // Set initial content
    updateEditorContent();
};

const setupMenuHandlers = () => {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    // Save button handled inline to avoid unused variable warnings

    if (!toggleMenu || !menuContent) {
        console.error('Menu elements not found during setup');
        return;
    }

    // Toggle menu visibility with proper event handling
    const toggleMenuVisibility = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[DEBUG MENU] Toggle menu clicked');
        const isHidden = menuContent.classList.contains('hidden');
        console.log('[DEBUG MENU] Current state:', isHidden ? 'hidden' : 'visible');
        
        if (isHidden) {
            menuContent.classList.remove('hidden');
            toggleMenu.setAttribute('aria-expanded', 'true');
            menuContent.setAttribute('aria-hidden', 'false');
            console.log('[DEBUG MENU] Menu showing');
        } else {
            menuContent.classList.add('hidden');
            toggleMenu.setAttribute('aria-expanded', 'false');
            menuContent.setAttribute('aria-hidden', 'true');
            console.log('[DEBUG MENU] Menu hiding');
        }
    };

    // Remove any existing listeners to prevent duplicates
    toggleMenu.removeEventListener('click', toggleMenuVisibility);
    toggleMenu.addEventListener('click', toggleMenuVisibility);

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
    document.getElementById('save-keys-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[DEBUG API] Save button clicked - setupMenuHandlers');
        const cohereKey = document.getElementById('cohere-api').value;
        const huggingfaceKey = document.getElementById('huggingface-api').value;
        const selectedApi = document.querySelector('input[name="api-selector"]:checked').value;

        console.log('[DEBUG API] Values captured:', { cohereKey: cohereKey ? 'SET' : 'EMPTY', huggingfaceKey: huggingfaceKey ? 'SET' : 'EMPTY', selectedApi });

        // Save to localStorage (you might want to use more secure storage in production)
        try {
            localStorage.setItem('selectedApi', selectedApi);
            if (cohereKey) localStorage.setItem('cohereApiKey', cohereKey);
            if (huggingfaceKey) localStorage.setItem('huggingfaceApiKey', huggingfaceKey);

            console.log('[DEBUG API] About to show notification: "API settings saved successfully"');
            showNotification('API settings saved successfully', 'success', 3000);
            menuContent?.classList.add('hidden');
        } catch (error) {
            console.log('[DEBUG API] Error saving:', error.message);
            showNotification(`Failed to save API settings: ${error.message}`, 'error', 5000);
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContent?.contains(e.target) && !toggleMenu?.contains(e.target)) {
            menuContent?.classList.add('hidden');
            toggleMenu.setAttribute('aria-expanded', 'false');
            menuContent.setAttribute('aria-hidden', 'true');
        }
    });

    // Initialize menu in hidden state
    if (menuContent) {
        menuContent.classList.add('hidden');
        toggleMenu.setAttribute('aria-expanded', 'false');
        menuContent.setAttribute('aria-hidden', 'true');
    }

    // ─── SFIA Colours Toggle ───
    const sfiaColoursToggle = document.getElementById('sfia-colours-toggle');
    if (sfiaColoursToggle) {
        // Restore saved preference
        const saved = localStorage.getItem('sfiaColoursEnabled');
        if (saved === 'true') {
            document.body.classList.add('sfia-colours-on');
            sfiaColoursToggle.checked = true;
        }

        sfiaColoursToggle.addEventListener('change', () => {
            if (sfiaColoursToggle.checked) {
                document.body.classList.add('sfia-colours-on');
                localStorage.setItem('sfiaColoursEnabled', 'true');
            } else {
                document.body.classList.remove('sfia-colours-on');
                localStorage.setItem('sfiaColoursEnabled', 'false');
            }
        });
    }
};

// Removed duplicate setupApiMenuHandlers function - conflicts with setupMenuHandlers

export const setupDOMContentLoadedHandler = () => {
    console.log('[DEBUG INIT] DOM Content Loaded - setting up handlers');
    
    // Add a slight delay to ensure all elements are rendered
    setTimeout(() => {
        console.log('[DEBUG INIT] Setting up menu handlers after timeout');
        setupMenuHandlers();
        
        // Verify elements exist
        const toggleMenu = document.getElementById('toggle-menu');
        const menuContent = document.getElementById('menu-content');
        console.log('[DEBUG INIT] Toggle menu element:', toggleMenu ? 'EXISTS' : 'NOT FOUND');
        console.log('[DEBUG INIT] Menu content element:', menuContent ? 'EXISTS' : 'NOT FOUND');
        
        if (toggleMenu && menuContent) {
            console.log('[DEBUG INIT] Menu content initial classes:', menuContent.className);
        }
        
        initializeAceEditor();
    }, 100);
};

document.addEventListener('DOMContentLoaded', setupDOMContentLoadedHandler);

// Removed duplicate setupApiKeyManagement function and its DOMContentLoaded listener
// All API key management is now handled by setupMenuHandlers

/**
 * Shows a notification message via the <sfia-notification> Web Component.
 * Falls back to a document-level custom event if the element isn't found.
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 * @param {number} duration - How long to show the notification in milliseconds
 */
export const showNotification = (message, type = 'success', duration = 5000) => {
    const el = document.querySelector('sfia-notification');
    if (el && typeof el.show === 'function') {
        el.show(message, type, duration);
    } else {
        // Dispatch event — the component will pick it up once connected
        document.dispatchEvent(new CustomEvent('sfia:notify', {
            detail: { message, type, duration }
        }));
    }
};

/**
 * @deprecated Notification dismissal is now handled by the <sfia-notification> component.
 * Kept for backward compatibility with any external callers.
 */
export const removeNotification = (notification) => {
    if (notification && notification.parentElement) {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentElement) notification.parentElement.removeChild(notification);
        }, 300);
    }
};

// Replace clipboard alert with notification
export const copyToClipboard = () => {
    try {
        const content = (editor || window.editor)?.getValue?.();
        if (!content && content !== '') {
            showNotification('Editor is not ready – please try again', 'error');
            return;
        }
        navigator.clipboard.writeText(content).then(() => {
            showNotification('Content copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy content: ', err);
            showNotification('Failed to copy content to clipboard', 'error');
        });
    } catch (err) {
        console.error('Copy to clipboard error: ', err);
        showNotification('Failed to copy content to clipboard', 'error');
    }
};

// Consolidate all menu-related initialization into a single function
export const initializeMenuHandlers = () => {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    // Save button handled elsewhere; avoid unused variable

    if (!toggleMenu || !menuContent) {
        console.error('Menu elements not found');
        return;
    }

    // Load saved API keys and restore them to the form
    loadSavedApiKeys();

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

    // Close menu on Escape key and return focus to toggle button
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menuContent.classList.contains('hidden')) {
            menuContent.classList.add('hidden');
            toggleMenu.setAttribute('aria-expanded', 'false');
            menuContent.setAttribute('aria-hidden', 'true');
            toggleMenu.focus();
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

/**
 * Load saved API keys from localStorage and restore them to the form inputs
 */
const loadSavedApiKeys = () => {
    try {
        // Load saved API keys
        const savedCohereKey = localStorage.getItem('cohereApiKey');
        const savedHuggingfaceKey = localStorage.getItem('huggingfaceApiKey');
        const savedSelectedApi = localStorage.getItem('selectedApi');

        // Restore Cohere API key
        const cohereInput = document.getElementById('cohere-api');
        if (cohereInput && savedCohereKey) {
            cohereInput.value = savedCohereKey;
        }

        // Restore Hugging Face API key
        const huggingfaceInput = document.getElementById('huggingface-api');
        if (huggingfaceInput && savedHuggingfaceKey) {
            huggingfaceInput.value = savedHuggingfaceKey;
        }

        // Restore selected API option
        if (savedSelectedApi) {
            const apiRadio = document.querySelector(`input[name="api-selector"][value="${savedSelectedApi}"]`);
            if (apiRadio) {
                apiRadio.checked = true;
            }
        }

        console.log('Saved API keys restored successfully');
    } catch (error) {
        console.error('Error loading saved API keys:', error);
    }
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