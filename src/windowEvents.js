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
            showNotification('Loading default SFIA content...', 'info');
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
        showNotification('Error loading content: ' + error.message, 'error');
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
        // Show loading notification
        showNotification('Loading SFIA content...', 'info');

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
            showNotification('Content loaded from URL hash', 'success');
        } else {
            console.log('Hash does not exist, appending # to URL:', currentURL);
            showNotification('Ready to start', 'success');
        }

        // Set the stored version
        setStoredVersion("json_source_v8");
    } catch (error) {
        console.error('An error occurred during the onload function:', error.message);
        showNotification('Error initializing application: ' + error.message, 'error');
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
});

function initializeMenuHandlers() {
    const toggleMenu = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');

    if (!toggleMenu || !menuContent) {
        console.error("Menu elements not found");
        return;
    }

    // Ensure menu starts hidden
    menuContent.style.display = 'none';
    menuContent.setAttribute('aria-hidden', 'true');
    toggleMenu.setAttribute('aria-expanded', 'false');

    function updateMenuPosition() {
        const toggleRect = toggleMenu.getBoundingClientRect();
        const top = toggleRect.bottom + 5; // 5px gap below button
        menuContent.style.top = top + 'px';
        menuContent.style.right = '20px';
        menuContent.style.maxHeight = (window.innerHeight - top - 20) + 'px';
    }

    function toggleMenuVisibility(e) {
        e.preventDefault();
        e.stopPropagation();
        const isHidden = (menuContent.style.display === 'none' || menuContent.style.display === '');
        if (isHidden) {
            console.log("Showing menu");
            menuContent.style.display = 'block';
            updateMenuPosition();
            menuContent.setAttribute('aria-hidden', 'false');
            toggleMenu.setAttribute('aria-expanded', 'true');
        } else {
            console.log("Hiding menu");
            menuContent.style.display = 'none';
            menuContent.setAttribute('aria-hidden', 'true');
            toggleMenu.setAttribute('aria-expanded', 'false');
        }
    }

    // Remove any existing listener by replacing with a clone
    const newToggleMenu = toggleMenu.cloneNode(true);
    toggleMenu.parentNode.replaceChild(newToggleMenu, toggleMenu);
    newToggleMenu.addEventListener('click', toggleMenuVisibility);

    // Hide menu if clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContent.contains(e.target) && !newToggleMenu.contains(e.target)) {
            if (menuContent.style.display === 'block') {
                console.log("Click outside detected: Hiding menu");
                menuContent.style.display = 'none';
                menuContent.setAttribute('aria-hidden', 'true');
                newToggleMenu.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Update menu position on window resize if visible
    window.addEventListener('resize', () => {
        if (menuContent.style.display === 'block') {
            updateMenuPosition();
        }
    });
}

// Initialize menu handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeMenuHandlers();
});

document.addEventListener('DOMContentLoaded', function () {
    const cohereApiInput = document.getElementById('cohere-api');
    const huggingfaceApiInput = document.getElementById('huggingface-api');
    const saveKeysBtn = document.getElementById('save-keys-btn');

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

    // Notification function
    function showNotification(message, type = 'success') {
        alert(message);  // Replace with a more sophisticated notification system if desired
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

    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.querySelector('main').insertBefore(container, document.querySelector('main').firstChild);
    }

    // Initialize notification handling for existing buttons
    initializeNotificationHandlers();
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
