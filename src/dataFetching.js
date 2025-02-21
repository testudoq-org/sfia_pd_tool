// BOF: src/dataFetching.js

/**
 * Initialize local JSON loading functionality - only used with file:/// protocol
 */
function initializeLocalJsonLoading() {
    if (window.location.protocol !== 'file:') {
        return;
    }

    console.log('Initializing local JSON loading...');
    const loadBtn = document.getElementById('localJsonLoadBtn');
    const fileInput = document.getElementById('localJsonFileInput');

    if (!loadBtn || !fileInput) {
        console.error('Required elements for local JSON loading not found');
        return;
    }

    // Show the button only when running under file:/// protocol
    loadBtn.style.display = 'inline-block';

    // Show the file chooser when clicking the button
    loadBtn.addEventListener('click', () => fileInput.click());

    // Handle file selection
    if (!fileInput.dataset.listenerBound) {
        fileInput.addEventListener('change', handleLocalFileSelection);
        fileInput.dataset.listenerBound = 'true';
    }
}

/**
 * Handles the selection of a local JSON file
 * @param {Event} event - The file input change event
 */
async function handleLocalFileSelection(event) {
    const file = event.target.files[0];
    if (!file) {
        showNotification('No file selected', 'warning');
        return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
        showNotification('Please select a JSON file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            
            // Set pseudo-version for local file
            document.cookie = 'selectedVersion=localFile; path=/';
            
            // Update global state
            window.sfiaJson = jsonData;
            
            // Initialize content with loaded data
            if (typeof initializeSFIAContent === 'function') {
                await initializeSFIAContent(jsonData);
                showNotification('JSON file loaded successfully', 'success');
            } else {
                throw new Error('Required initialization function not found');
            }
        } catch (error) {
            console.error('Error processing JSON:', error);
            showNotification('Error processing JSON file: ' + error.message, 'error');
        }
    };

    reader.onerror = () => {
        showNotification('Error reading file', 'error');
    };

    reader.readAsText(file);
}

/**
 * Asynchronously fetches data from a given URL.
 * @param {string} url - The URL to fetch data from.
 * @return {Promise} A Promise that resolves to the parsed JSON response.
 * @throws {Error} If the HTTP response is not ok.
 */
async function fetchData(url) {
    try {
        // For file:/// protocol, use local file loading
        if (window.location.protocol === 'file:') {
            return await new Promise((resolve, reject) => {
                const fileInput = document.getElementById('localJsonFileInput');
                if (!fileInput) {
                    reject(new Error('File input element not found'));
                    return;
                }

                const handleChange = (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        reject(new Error('No file selected'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const jsonData = JSON.parse(e.target.result);
                            resolve(jsonData);
                        } catch (error) {
                            reject(new Error('Invalid JSON file'));
                        }
                    };
                    reader.onerror = () => reject(new Error('Error reading file'));
                    reader.readAsText(file);

                    fileInput.removeEventListener('change', handleChange);
                };

                fileInput.addEventListener('change', handleChange);
                fileInput.click();
            });
        }

        // For HTTP/HTTPS, use fetch
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

/**
 * Retrieves the value of a cookie by its name.
 * @param {string} name - The name of the cookie.
 * @returns {string|undefined} The value of the cookie, or undefined if not found.
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

/**
 * Sets the selected version in the cookie
 * @param {string} version - The version to store
 */
function setStoredVersionToCookie(version) {
    document.cookie = `selectedVersion=${version}`;
}

/**
 * Sets the stored version and initializes content
 * @param {string} storedVersion - The version to be stored
 */
function setStoredVersion(storedVersion) {
    const storedVersionFromCookie = getStoredVersionFromCookie();
    const dropdownValue = setDropdownValue(storedVersionFromCookie);
    const jsonData = fetchSelectedVersionData(dropdownValue);
    setupEventListenersForData(jsonData);
}

/**
 * Gets the stored version from cookie
 * @returns {string} The stored version or null
 */
function getStoredVersionFromCookie() {
    return getCookie("selectedVersion") || null;
}

/**
 * Sets the dropdown value based on stored version
 * @param {string} storedVersion - Version to set
 * @returns {string} The selected version
 */
function setDropdownValue(storedVersion) {
    let dropdown = document.getElementById("jsonVersionSelect");
    if (!dropdown.value || dropdown.value === null || dropdown.value === undefined) {
        dropdown.value = storedVersion;
    }
    return dropdown.value;
}

/**
 * Fetches JSON data for selected version
 * @param {string} dropdownValue - Selected version
 * @returns {Promise<Object>} JSON data
 */
/**
 * Fetches JSON data for selected version
 * @param {string} dropdownValue - Selected version from dropdown
 * @returns {Promise<Object>} JSON data
 */
async function fetchSelectedVersionData(dropdownValue) {
    // Default to SFIA v8 if no version specified
    dropdownValue = dropdownValue || "json_source_v8";
    
    // Ensure valid version format
    if (!dropdownValue.match(/^json_source_v[7-9]$/)) {
        console.warn(`Invalid version format: ${dropdownValue}, defaulting to SFIA v8`);
        dropdownValue = "json_source_v8";
    }
    
    try {
        const jsonUrl = dropdownValue + ".json";
        const jsonData = await fetchData(jsonUrl);
        return jsonData;
    } catch (error) {
        console.error(`Error loading ${dropdownValue}:`, error);
        // If selected version fails and it's not already v8, try falling back to v8
        if (dropdownValue !== "json_source_v8") {
            console.log("Attempting fallback to SFIA v8...");
            return await fetchData("json_source_v8.json");
        }
        throw error; // Re-throw if v8 also fails
    }
}

/**
 * Sets up event listeners for JSON data
 * @param {Object} jsonData - The JSON data
 */
function setupEventListenersForData(jsonData) {
    window.sfiaJson = jsonData;
    setupEventListeners(jsonData);
}

// Initialize local JSON loading if using file:/// protocol
if (window.location.protocol === 'file:') {
    document.addEventListener('DOMContentLoaded', initializeLocalJsonLoading);
}

// EOF: src/dataFetching.js
