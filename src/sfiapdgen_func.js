// BOF: init.js

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing application...');

    try {
        // Set up version selection handling
        initializeVersionSelection();

        // Hide the local JSON loading button by default
        const loadBtn = document.getElementById('localJsonLoadBtn');
        if (loadBtn) {
            loadBtn.style.display = 'none';
        }

        // Initialize content with appropriate data loading
        await initializeContent();

          // Toggle instructions on page load
          //$('#instructions').collapse('toggle');

    } catch (error) {
        console.error('Error during application initialization:', error);
        showNotification('Error initializing application: ' + error.message, 'error');
    }
});

/**
 * Initialize version selection dropdown and handle changes
 */
function initializeVersionSelection() {
    const versionSelect = document.getElementById('jsonVersionSelect');
    if (!versionSelect) {
        console.error('Version selection dropdown not found');
        return;
    }

    // Show version selector for HTTP/HTTPS protocol
    if (window.location.protocol !== 'file:') {
        // Load saved version preference from cookie, default to v8 if none found
        const savedVersion = document.cookie
            .split('; ')
            .find(row => row.startsWith('selectedVersion='));
        
        if (savedVersion) {
            const version = savedVersion.split('=')[1];
            versionSelect.value = version;
        } else {
            // Set v8 as default if no cookie exists
            versionSelect.value = 'json_source_v8';
            document.cookie = 'selectedVersion=json_source_v8; path=/';
        }

        // Show version selector
        versionSelect.parentElement.style.display = 'flex';
    } else {
        // Hide version selector for file:/// protocol
        versionSelect.parentElement.style.display = 'none';
    }

    // Handle version changes
    versionSelect.addEventListener('change', async function() {
        const selectedVersion = this.value;
        
        try {
            // Save version preference
            document.cookie = `selectedVersion=${selectedVersion}; path=/`;
            
            // Reload content with new version
            await initializeContent();
            
            showNotification(`Successfully switched to SFIA ${selectedVersion.replace('json_source_v', '')}`, 'success');
        } catch (error) {
            console.error('Error switching versions:', error);
            showNotification('Error switching versions: ' + error.message, 'error');
        }
    });
}

/**
 * Shows a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('Notification container not found');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 5000);
}

// Initialize local JSON loading
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('localJsonLoadBtn');
    if (loadBtn) {
        // Only show button for file:/// protocol
        loadBtn.style.display = window.location.protocol === 'file:' ? 'inline-block' : 'none';
    }
});

// EOF: init.js
;/**
 * Toggle between light and dark themes.
 */
function toggleTheme() {
    const lightTheme = document.querySelector('link[href="styles-light.css"]');
    const darkTheme = document.querySelector('link[href="styles-dark.css"]');
    const isLight = !document.getElementById('theme-switch').checked;
    
    lightTheme.disabled = !isLight;
    darkTheme.disabled = isLight;
    
    // Save preference
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.getElementById('theme-switch').checked = savedTheme === 'dark';
    toggleTheme();
});
;// src/constants.js

// This file contains constant variables or configuration values used throughout the project.

let sfiaJson = fetchSelectedVersionData();  // declare sfiaJson at a higher scope
let lorJson; // declare lorJson at a higher scope
let lastExportTime = 0; // Initialize lastExportTime to 0
const $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };
const SELECTED_VERSION = "selectedVersion";
// Initialize global variables with values from the URL hash
const urlHashParts = window.location.hash.substring(1).split("&&"); // Remove the "#" symbol and split by "&&"
g_sfiahash = urlHashParts[0];
g_lorhash = urlHashParts[1];
;// BOF: src/browserUpdate.js

// // This file contains the code for appending a script tag to the document body, loading the Browser Update script

/**
 * Function $buo_f is responsible for appending a script tag to the
 * document body. This script tag loads the Browser Update script
 * from the specified source.
 */
function $buo_f() {
    // Create a new script element
    let scriptElement = document.createElement("script");

    // Set the source of the script element to the Browser Update script
    scriptElement.src = "https:////browser-update.org/update.min.js";

    // Append the script element to the document body
    document.body.appendChild(scriptElement);
}

// Check if the hostname is 127.0.0.1 to skip the code
if (window.location.hostname !== '127.0.0.1') {
    try {
        document.addEventListener("DOMContentLoaded", $buo_f, false);
    } catch (e) {
        window.attachEvent("onload", $buo_f);
    }
}
// EOF: src/browserUpdate.js
;// BOF: src/dataFetching.js

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
;// BOF: loadLocalJson.js

function loadLocalJsonFile(callback) {
  const fileInput = document.getElementById("localJsonFileInput");
  console.log("Initialized loadLocalJsonFile function.");

  if (!fileInput.dataset.listenerBound) {
    console.log("Setting up event listener for file input change.");
    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      if (!file) {
        console.warn("No file selected.");
        return;
      }

      console.log("File selected:", file.name);
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const jsonData = JSON.parse(event.target.result);
          console.log("Local JSON parsed successfully:", jsonData);

          // Set pseudo-version for local file
          document.cookie = "selectedVersion=localFile; path=/";
          console.log("Set selectedVersion cookie to 'localFile'");

          // Update global SFIA data
          sfiaJson = jsonData;
          console.log("Global sfiaJson updated.");

          // Initialize content with loaded data
          initializeSFIAContent(jsonData);
          console.log("SFIA content initialized.");

          if (typeof callback === "function") {
            console.log("Executing callback function.");
            callback(jsonData);
          }

          showNotification('JSON file loaded successfully', 'success');
          console.log("Success notification displayed.");
        } catch (e) {
          console.error("Error parsing JSON:", e);
          showNotification('Error loading JSON file: ' + e.message, 'error');
        }
      };
      reader.readAsText(file);
    });

    fileInput.dataset.listenerBound = "true";
    console.log("Event listener marked as bound.");
  }
}

// EOF: loadLocalJson.js
;// src/exportFunctions.js

function getCheckedBoxes() {
    return document.querySelectorAll('input[type="checkbox"][id^="sfia-checkbox-"]:checked');
}

function processCheckedBoxes(checkedBoxes, sfiaJson) {
    const data = [];
    checkedBoxes.forEach(box => {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));
        const categoryData = sfiaJson[jsonData.category];
        const subCategoryData = categoryData[jsonData.subCategory];
        const skillData = subCategoryData[jsonData.skill];

        if (categoryData && subCategoryData && skillData) {
            const skillCode = skillData["code"];
            const skillDescription = skillData["description"];
            const skillLevel = skillData["levels"][jsonData.level];

            if (skillCode && skillDescription && skillLevel) {
                data.push([
                    `${jsonData.skill} ${skillCode}-${jsonData.level}`,
                    skillDescription,
                    skillLevel
                ]);
            } else {
                console.error(`Incomplete or missing data for ${jsonData.category}/${jsonData.subCategory}/${jsonData.skill}`);
            }
        } else {
            console.error(`Skill data not found for ${jsonData.category}/${jsonData.subCategory}/${jsonData.skill}`);
        }
    });

    return data;
}

function generateCSVContent(data) {
    let csvContent = "";
    data.forEach(infoArray => {
        let dataString = '"' + infoArray.join('","') + '"';
        csvContent += dataString + "\n";
    });
    return csvContent;
}

/**
 * Export the CSV content to a downloadable CSV file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
function exportCSV(event, sfiaJson) {
    // Log the function trigger and the event object
    console.log('Export CSV button triggered');
    console.log('Event:', event);

    // Prevent the default action associated with the event
    event.preventDefault();

    // Get the checked boxes
    const checkedBoxes = getCheckedBoxes();

    // Process the checked boxes and generate the CSV content
    const processedData = processCheckedBoxes(checkedBoxes, sfiaJson);
    const csvContent = generateCSVContent(processedData);

    // Create a blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Create an anchor element to download the CSV file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PositionSummary.csv';
    a.setAttribute('visibility', 'hidden');
    document.body.appendChild(a);

    // Trigger the download
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export the HTML content to a downloadable HTML file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
function exportHTML(event, sfiaJson) {
    // Log the function trigger and the event object
    console.log('Export HTML button triggered');
    console.log('Event:', event);

    // Prevent the default action associated with the event
    event.preventDefault();

    // Check if the last export was within the timeout duration
    if (isExportSkippedDueToTimeout(3000)) {
        console.log("Export HTML skipped due to timeout.");
        return; // Return early to prevent multiple downloads
    }

    // Update the last export time
    lastExportTime = new Date().getTime();

    // Get the HTML content from the specified element
    const htmlContent = document.getElementById('sfia-output').innerHTML;

    // Get values from the URL after the #
    const urlHash = window.location.hash.replace('#/', '');

    // Get the current date in ddmmccyy format
    const currentDate = new Date();
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const yyyy = currentDate.getFullYear();
    const dateStr = dd + mm + yyyy;

    // Generate the filename based on URL values and date
    const filenameBase = `PositionSummary_${urlHash}`;
    const filenameEnd = `_${dateStr}.html`;

    // Ensure the filename doesn't exceed 255 characters
    let truncatedFilename;
    if (filenameBase.length + filenameEnd.length > 255) {
        const availableSpace = 255 - filenameEnd.length;
        truncatedFilename = filenameBase.slice(0, availableSpace) + filenameEnd;
    } else {
        truncatedFilename = filenameBase + filenameEnd;
    }

    // Create a download link for the HTML file
    const encodedUri = encodeURI(htmlContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/plain;charset=utf-8,' + encodedUri;
    a.download = truncatedFilename;

    // Append the link to the body, trigger the click event, and remove the link
    document.body.appendChild(a);
    a.click();
    a.remove();
}

/**
 * Save the content of a specified element to a file with versioning and date-time stamping.
 * @param {string} elementId - The ID of the element whose content is to be saved.
 * @param {string} baseFilename - The base name of the file to save the content to.
 */
function saveContentToFile(elementId, baseFilename) {
    const content = document.getElementById(elementId).innerHTML;
    const version = document.getElementById("jsonVersionSelect").value;
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `${baseFilename}_v${version}_${timestamp}.html`;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Save the SFIA content to a file.
 */
function saveSfiaContent() {
    saveContentToFile('sfia-output', 'SFIA_Content');
}

/**
 * Save the LOR content to a file.
 */
function saveLorContent() {
    saveContentToFile('lor-output', 'LOR_Content');
}
;// src/checkboxHandling.js

// This file contains functions for checking if a specific SFIA skill level is present in the URL hash and generating table cells with checkboxes.

/**
 * Checks if a specific SFIA skill level is present in the URL hash.
 *
 * @param {string} code - The code of the skill.
 * @param {number} level - The level of the skill.
 * @return {boolean} True if the level is present in the URL hash, false otherwise.
 */
function checkSfiaPreselected(code, level) {
    // Check if the URL hash exists and is not empty
    if (window.location.hash) {
        // Get the levels from the URL hash
        const hashLevels = window.location.hash.substring(1).split("+");
        // Iterate through the levels in reverse order
        for (let i = hashLevels.length - 1; i >= 0; i--) {
            // Get the code and level from the current level
            const hashLevel = hashLevels[i].split("-");
            const check_code = hashLevel[0];
            const check_level = parseInt(hashLevel[1]);

            // Check if the current level matches the provided code and level
            if (code === check_code && level === check_level) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Generates a table cell element with a checkbox input. The checkbox 
 * is associated with a specific skill level of a given skill. The 
 * function checks if the level is present in the skill's levels 
 * property and if it is, it generates a checkbox with the appropriate 
 * data attributes and checked status. If the level is not present, 
 * the function generates a disabled checkbox.
 *
 * @param {number} index - The index of the level.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 * @param {string} rootKey - The key for the root category.
 * @param {string} subKey - The key for the sub category.
 * @param {string} skillKey - The key for the skill.
 * @param {string} code - The code associated with the skill.
 * @return {HTMLElement} The table cell element with the checkbox.
 */
function addSfiaSelectionBox(index, sfiaJson, rootKey, subKey, skillKey, code) {
    // Create a table cell element
    const col = document.createElement('td');

    // Check if the level is present in the skill's levels property
    if (sfiaJson[rootKey][subKey][skillKey]["levels"].hasOwnProperty(index)) {
        // Generate the JSON data for the checkbox input
        const jsonData = JSON.stringify({
            "category": rootKey,
            "subCategory": subKey,
            "skill": skillKey,
            "level": index
        });

        // Check if the skill should be preselected and set the checked attribute accordingly
        const checked = checkSfiaPreselected(sfiaJson[rootKey][subKey][skillKey]["code"], index) ? "checked" : "";

        // Generate the checkbox input with the appropriate data attributes
        col.innerHTML = `<input type='checkbox' id="sfia-checkbox-${sfiaJson[rootKey][subKey][skillKey]["code"]}-${index}" value="${code}-${index}" title='${sfiaJson[rootKey][subKey][skillKey]["levels"][index]}' sfia-data='${jsonData}' ${checked}/>`;
        col.className += " select_col";
    } else {
        // Generate a disabled checkbox if the level is not present
        col.innerHTML = "<input type='checkbox' disabled/>";
        col.className += " no_select_col";
    }

    // Add the appropriate class to the table cell
    col.className += " col-checkbox";

    // Return the generated table cell element
    return col;
}

/**
 * Selects checkboxes based on the URL hash and triggers the renderLorOutput function or
 * any other logic needed after checkboxes are pre-selected. If no checkboxes are 
 * selected, it initializes LoR content.
 * 
 * @param {Object} lorJson - The LoR JSON data.
 */
function selectLorCheckboxesAndInitialize(lorJson) {
    // Parse URL hash and pre-select checkboxes
    // Remove the '#' character from the beginning of the hash
    const urlHash = window.location.hash.replace('#', '');

    // Split the URL hash into an array of selected checkboxes
    const selectedCheckboxes = urlHash.split('+');

    // If there are selected checkboxes
    if (selectedCheckboxes.length > 0) {
        // Iterate over each selected checkbox
        selectedCheckboxes.forEach(selectedCheckbox => {
            // Split the selected checkbox into responsibility and level
            const [responsibility, level] = selectedCheckbox.split('-');

            // Find the corresponding checkbox and pre-select it
            const checkbox = document.querySelector(`input[type=checkbox][id^="lor-${responsibility}-${level}"]`);

            // If the checkbox exists, pre-select it
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Trigger the renderLorOutput function or any other logic
        // needed after checkboxes are pre-selected
        renderLorOutput(lorJson, true);
    } else {
        // If there are no selected checkboxes, initialize LoR content
        initializeLorContent(lorJson);
    }
}

/**
 * Selects checkboxes based on the URL hash and triggers
 * the renderSfiaOutput function or any other logic needed after
 * checkboxes are pre-selected. If no checkboxes are selected,
 * it initializes SFIA content. ** THIS IS BEING USED TO PRESELECT FROM HASH ****
 *
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
function SelectSfiaCheckboxesAndInitialize(sfiaJson) {
    // Parse URL hash and pre-select checkboxes
    const urlHash = window.location.hash.replace('#', '');
    const selectedCheckboxes = urlHash.split('+');

    // If there are selected checkboxes, pre-select them
    if (selectedCheckboxes.length > 0) {
        // Iterate over each selected checkbox
        selectedCheckboxes.forEach(selectedCheckbox => {
            // Split the selected checkbox into code and level
            const [code, level] = selectedCheckbox.split('-');

            // Find the corresponding checkbox and pre-select it
            const checkbox = document.querySelector(`input[type=checkbox][data-code="${code}"][data-level="${level}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Trigger the renderSfiaOutput function or any other logic
        // needed after checkboxes are pre-selected
        renderSfiaOutput(sfiaJson, true);

   
    } else {
        // If there are no selected checkboxes, initialize SFIA content
        initializeSFIAContent(sfiaJson);

    }
}
;// BOF: initializeContent.js

/**
 * Asynchronously initializes the content by calling the functions to initialize SFIA and LOR content.
 */
async function initializeContent() {
    console.log('Initializing content...');

    // Initialize SFIA content
    console.log('Initializing SFIA content...');
    await initializeSFIAContent(sfiaJson);
    
    // Initialize LOR content
    console.log('Initializing LOR content...');
    await initializeLorContent(lorJson);
}

/**
 * Asynchronously initializes the checkboxes and content by calling the functions to select SFIA checkboxes and initialize LOR checkboxes.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
async function initializeCheckboxesAndContent(sfiaJson) {
    // Debugging information
    console.log('Initializing checkboxes and content...');

    // Select SFIA checkboxes and initialize
    console.log('Selecting SFIA checkboxes and initializing...');
    await SelectSfiaCheckboxesAndInitialize(sfiaJson);
    
    // Select LOR checkboxes and initialize
    console.log('Selecting LOR checkboxes and initializing...');
    await selectLorCheckboxesAndInitialize(lorJson);
}

/**
 * Initialize SFIA content by populating a table with SFIA JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
async function initializeSFIAContent(sfiaJson) {
    try {
        console.log('Initializing SFIA content...');

        // Arrays to keep track of printed root and sub keys
        const rootKeyPrinted = [];
        const subKeyPrinted = [];

        // Get the table element
        const table = document.getElementById('sfia-content');
        table.innerHTML = ''; // Clear existing content before populating with new data
        console.log('Table element cleared');

        // Loop through the SFIA JSON and populate the table with data
        for (const rootKey in sfiaJson) {
            console.log('Processing root key:', rootKey);
            for (const subKey in sfiaJson[rootKey]) {
                console.log('Processing sub key:', subKey);
                for (const skillKey in sfiaJson[rootKey][subKey]) {
                    // Create a new row for each skill
                    const row = document.createElement('tr');
                    row.className += " " + rootKey.trim().replace(/ /g, "_").toLowerCase();

                    // Add the root key to the row if it hasn't been printed before
                    const col1 = document.createElement('td');
                    if (rootKeyPrinted.indexOf(rootKey) === -1) {
                        rootKeyPrinted.push(rootKey);
                        col1.textContent = rootKey;
                    }
                    col1.className += " root_key";
                    row.appendChild(col1);

                    // Add the sub key to the row if it hasn't been printed before
                    const col2 = document.createElement('td');
                    if (subKeyPrinted.indexOf(subKey) === -1) {
                        subKeyPrinted.push(subKey);
                        col2.textContent = subKey;
                    }
                    col2.className += " sub_key";
                    row.appendChild(col2);

                    // Add the skill key and its code to the row
                    const col3 = document.createElement('td');
                    col3.className += " skill_key";
                    row.appendChild(col3);
                    
                    let skillcode = sfiaJson[rootKey][subKey][skillKey]["code"]
                    const skillSpan = document.createElement('span');
                    skillSpan.textContent = skillKey + " - " + sfiaJson[rootKey][subKey][skillKey]["code"];
                    skillSpan.title = sfiaJson[rootKey][subKey][skillKey]["description"];
                    col3.appendChild(skillSpan);

                    // Add the selection boxes to the row
                    for (let i = 1; i < 8; i++) {
                        row.appendChild(addSfiaSelectionBox(i, sfiaJson, rootKey, subKey, skillKey, skillcode));
                    }

                    table.appendChild(row); // add entire row to table.
                }
            }
        }

        // Add a click event listener to each checkbox
        const sfiacheckboxes = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]');
        sfiacheckboxes.forEach(function (checkbox) {
            checkbox.addEventListener('click', () => renderSfiaOutput(sfiaJson), false);
        });
        console.log('Click event listeners added to checkboxes');

    } catch (error) {
        console.error('Error initializing SFIA content:', error);
    }

    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        console.log('URL contains a hash, rendering output...');
        renderSfiaOutput(sfiaJson, false);
    }
}

/**
 * Fetches and displays Levels of Responsibility data from the 'sfia-lors-8.json' file.
 * This function retrieves the data, clears any existing content in the table,
 * and then appends new rows to the table for each data item.
 * adds a tool tip to each of the checkboxes based on the description attribute of the lor
 */
async function initializeLorContent() {
    try {
        // Fetch LOR JSON data
        const response = await fetch('json-sfia-lors-v8.json');
        lorJson = await response.json();

        // Clear existing content in the LOR table body
        document.getElementById('sfia-lors-content').innerHTML = '';

        // Loop through LOR JSON data and build the checklist
        lorJson.forEach((responsibility, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${responsibility.Responsibility}</td> <!-- Responsibility -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-1" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-1" title="1 - Follow ~ ${responsibility['1 - Follow']}"></td> <!-- Level 1 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-2" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-2" title="2 - Assist ~ ${responsibility['2 - Assist']}"></td> <!-- Level 2 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-3" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-3" title="3 - Apply ~ ${responsibility['3 - Apply']}"></td> <!-- Level 3 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-4" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-4" title="4 - Enable ~ ${responsibility['4 - Enable']}"></td> <!-- Level 4 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-5" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-5" title="5 - Ensure,advise ~ ${responsibility['5 - Ensure,advise']}"></td> <!-- Level 5 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-6" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-6" title="6 - Initiate, influence ~ ${responsibility['6 - Initiate, influence']}"></td> <!-- Level 6 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-7" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-7" title="7 - Set strategy, inspire, mobilise ~ ${responsibility['7 - Set strategy, inspire, mobilise']}"></td> <!-- Level 7 -->
        `;
            document.getElementById('sfia-lors-content').appendChild(row);

            // Add a click event listener to each LOR checkbox
            const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');
            lorCheckboxes.forEach(function (checkbox) {
                checkbox.addEventListener('click', function () {
                    console.log('Checkbox clicked:', checkbox.id);
                    renderLorOutput(lorJson, false);
                }, false);
            });
        });
    } catch (error) {
        console.error('Error fetching or displaying LOR data:', error);
    }
    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        renderLorOutput(lorJson, false);
    }
}

// EOF: initializeContent.js
;// BOF: src/tableRendering.js

// This file includes functions for rendering the output HTML based on the selected checkboxes and the provided SFIA JSON data.

/**
 * Render the output HTML based on the selected checkboxes and the provided SFIA JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @param {boolean} updateHash - Flag to indicate whether to update the URL hash.
 */
function renderSfiaOutput(sfiaJson, updateHash = true) {
    const checkedBoxes = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]:checked');
    const filteredData = filterSfiaData(sfiaJson, checkedBoxes);
    renderSfiaHtmlOutput(filteredData);
    updateSfiaUrlHash(filteredData, updateHash);
}

/**
 * Filter SFIA JSON data based on the checked checkboxes.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @param {NodeList} checkedBoxes - The checked checkboxes.
 * @returns {Object} - Filtered SFIA data.
 */
function filterSfiaData(sfiaJson, checkedBoxes) {
    const filteredData = {};
    checkedBoxes.forEach(box => {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));
        filteredData[jsonData.category] ??= {};
        filteredData[jsonData.category][jsonData.subCategory] ??= {};
        filteredData[jsonData.category][jsonData.subCategory][jsonData.skill] ??= {
            description: sfiaJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.description,
            code: sfiaJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.code,
            levels: {},
        };
        filteredData[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level] = sfiaJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.levels?.[jsonData.level];
    });
    return filteredData;
}

/**
 * Render HTML output based on filtered SFIA data.
 * @param {Object} filteredData - Filtered SFIA data.
 */
function renderSfiaHtmlOutput(filteredData) {
    const html = document.getElementById('sfia-output');
    html.innerHTML = '';
    for (const category in filteredData) {
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = category;
        html.appendChild(categoryEle);
        renderSfiaSubCategoryAndSkills(html, filteredData[category]);
    }
}

/**
 * Render sub-category headings and skill information.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {Object} subCategories - Sub-categories data.
 */
function renderSfiaSubCategoryAndSkills(html, subCategories) {
    for (const subCategory in subCategories) {
        const subCategoryEle = document.createElement('h2');
        subCategoryEle.textContent = subCategory;
        html.appendChild(subCategoryEle);
        renderSfiaSkills(html, subCategories[subCategory]);
    }
}

/**
 * Render skills information.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {Object} skills - Skills data.
 */
function renderSfiaSkills(html, skills) {
    for (const skill in skills) {
        const skillEle = document.createElement('h3');
        skillEle.textContent = `${skill} - ${skills[skill]["code"]}`;
        html.appendChild(skillEle);
        renderSfiaSkillDescription(html, skills[skill]["description"]);
        renderSfiaSkillLevels(html, skills[skill]["levels"]);
    }
}

/**
 * Render skill description.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {string} description - Skill description.
 */
function renderSfiaSkillDescription(html, description) {
    const skillDescriptionEle = document.createElement('p');
    skillDescriptionEle.textContent = description;
    html.appendChild(skillDescriptionEle);
}

/**
 * Render skill level information.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {Object} levels - Skill levels data.
 */
function renderSfiaSkillLevels(html, levels) {
    for (const level in levels) {
        const levelEle = document.createElement('h4');
        levelEle.textContent = `Level ${level}`;
        html.appendChild(levelEle);
        renderSfiaLevelDescription(html, levels[level]);
    }
}

/**
 * Render level description.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {string} description - Level description.
 */
function renderSfiaLevelDescription(html, description) {
    const levelDescriptionEle = document.createElement('p');
    levelDescriptionEle.textContent = description;
    html.appendChild(levelDescriptionEle);
}

/**
 * Render the output HTML based on the selected Levels of Responsibility (LoR) checkboxes.
 * 
 * @param {Object} lorJson - The LoR JSON data.
 * @param {boolean} updateHash - Flag to indicate whether to update the URL hash.
 */
function renderLorOutput(lorJson, updateHash = true) {
    console.log("Entering renderLorOutput function");

    // Extract checked LoR data from the page
    const newLorJson = extractCheckedLorData();
    console.log("newLorJson:", newLorJson);

    console.log("Clearing lor-output element");
    clearLorOutput();

    console.log("Rendering LoR data to lor-output element");
    renderLorData(newLorJson);

    console.log("Generating URL hash");
    const generatedLorHash = generateUrlHash(newLorJson); // Store generated hash in a new variable
    console.log("generatedHash:", generatedLorHash);

    console.log("Updating URL hash if necessary");
    if (updateHash || generatedLorHash !== "") {
        console.log("Updating URL hash");
        updateURLWithLorCheckboxes(generatedLorHash); // Use the new variable
    }

    console.log("Exiting renderLorOutput function");
}

// EOF: src/tableRendering.js
;// BOF: src/dataHandling.js

/**
 * Render LoR data to lor-output element with improved styling.
 * 
 * @param {Array} newLorJson - Array of objects containing LoR data. Each object should have properties: lorCategory, lorLevel, and lorDescription.
 */
function renderLorData(newLorJson) {
    console.log("Entering renderLorData function");
    
    // Get the target element where the LoR data will be rendered
    const lorOutput = document.getElementById('lor-output');
    lorOutput.classList.add('lor-output-container'); // Add a CSS class for styling the container element

    // Loop through the newLorJson array and process each LoR data object
    for (const { lorCategory, lorLevel, lorDescription } of newLorJson) {
        console.log(`Rendering data for ${lorCategory} at level ${lorLevel}`);

        // Create a new element for the LoR category
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = lorCategory;
        categoryEle.classList.add('lor-category'); // Add a CSS class for styling the category element
        console.log(`Created category element for ${lorCategory}`);
        lorOutput.appendChild(categoryEle);

        // Create a new element to contain the LoR data
        const lorEle = document.createElement('div');
        lorEle.innerHTML = `
              <h2 class="lor-title">${lorCategory}</h2>
              <p class="lor-level">Level: ${lorLevel}</p>
              <p class="lor-description">Description: ${lorDescription}</p>
          `;
        lorEle.classList.add('lor-item'); // Add a CSS class for styling each LoR item
        console.log(`Created LoR element for ${lorCategory}`);
        lorOutput.appendChild(lorEle);
    }
    
    console.log("Exiting renderLorData function");
}

/**
 * Extract checked Levels of Responsibility (LoR) data from the page.
 * 
 * @returns {Array} - Array containing checked LoR data objects.
 * @throws {Error} - If any LoR checkbox is missing a required property.
 */
function extractCheckedLorData() {
    console.log("Entering extractCheckedLorData function");

    // Initialize an empty array to store the checked LoR data
    const newLorJson = [];

    console.log("Initialized newLorJson array");

    // Select all checked LoR checkboxes on the page
    const lorCheckedBoxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]:checked');

    console.log(`Found ${lorCheckedBoxes.length} checked LoR checkboxes`);

    // Loop through each checked LoR checkbox
    for (const box of lorCheckedBoxes) {
        // Extract the LoR information from the checkbox ID and value
        const [, , , lorCategory, lorLevel] = box.id.split('-');
        const lorValue = box.value;
        const lorDescription = box.title;

        // Check if any of the required properties is missing
        if (!lorCategory || !lorLevel || !lorValue || !lorDescription) {
            throw new Error(`Missing required property for LoR checkbox ${box.id}`);
        }

        console.log(`Extracted data from checkbox ${box.id}: ${lorCategory}-${lorLevel}: ${lorValue}. Title: ${lorDescription}`);

        // Add the LoR data to the newLorJson array
        newLorJson.push({
            lorCategory,
            lorLevel,
            lorValue,
            lorDescription
        });
    }

    console.log(`Returning ${newLorJson.length} checked LoR data items`);

    // Return the array containing checked LoR data
    return newLorJson;
}

/**
 * Clear the content of the lor-output element.
 */
function clearLorOutput() {
    const lorOutput = document.getElementById('lor-output');
    lorOutput.innerHTML = '';
}

// EOF: src/dataHandling.js
;// BOF: src/utilityFunctions.js

// This file includes utility functions, such as checking if the last export was within a specified timeout duration and searching for text in the SFIA table.

/**
 * Checks if the last export was within the specified timeout duration.
 *
 * @param {number} timeoutDuration - The timeout duration in milliseconds.
 * @return {boolean} True if the last export was within the timeout duration, false otherwise.
 */
function isExportSkippedDueToTimeout(timeoutDuration) {
    const currentTime = new Date().getTime();
    const timeSinceLastExport = currentTime - lastExportTime;
    return timeSinceLastExport < timeoutDuration;
}

/**
 * Function to search for text in the SFIA table and show/hide rows based on the filter.
 */
function searchForText() {
    try {
        // Get user input and filter value
        const input = document.getElementById('myInput'); // Get the input element
        if (!input) { // Check if the input element was found
            console.error("Input element not found.");
            return;
        }
        const filterValue = input.value.toUpperCase(); // Convert the input value to uppercase

        // Get table body and rows
        const tableBody = document.getElementById("sfia-content"); // Get the table body element
        if (!tableBody) { // Check if the table body element was found
            console.error("Table body element not found.");
            return;
        }
        const tableRows = tableBody.getElementsByTagName('tr'); // Get all the table rows
        if (!tableRows || tableRows.length === 0) { // Check if table rows were found
            console.error("No table rows found.");
            return;
        }

        // Loop through rows and show/hide based on filter
        for (let i = 0; i < tableRows.length; i++) {
            const skillKey = tableRows[i].getElementsByClassName("skill_key")[0]; // Get the skill key element
            if (!skillKey) { // Check if the skill key element was found
                console.error(`Skill key element not found for row ${i}.`);
                continue; // Skip this row
            }
            const skillText = skillKey.textContent; // Get the text content of the skill key
            if (skillText.toUpperCase().includes(filterValue)) { // Check if the filter value is included in the skill text
                tableRows[i].style.display = ""; // Show the row
            } else {
                tableRows[i].style.display = "none"; // Hide the row
            }
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

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
function saveContent(type) {
    if (type === 'sfia') {
        var sfiaContent = $('#sfia-output').html();
        $('#sfia-editor').val(sfiaContent);
    } else if (type === 'lor') {
        var lorContent = $('#lor-output').html();
        $('#lor-editor').val(lorContent);
    }
}

// EOF: src/utilityFunctions.js
;// BOF: src/jsonHandling.js

// This file contains a function to change the JSON version based on the selected value from a dropdown.

/**
 * Change the JSON version based on the selected value from the dropdown.
 * This function fetches the JSON data from the specified URL and initializes
 * the SFIA content and event listeners with the new JSON data.
 */
function changeJsonVersion() {

    // Get the selected value from the dropdown
    let selectedVersion = document.getElementById("jsonVersionSelect").value;

    // Check if selectedVersion is empty, null, or undefined, set default
    if (!selectedVersion || selectedVersion === null || selectedVersion === undefined) {
        selectedVersion = "json_source_v8";
    }

    // Set the selected version in the cookie
    setStoredVersionToCookie(selectedVersion);

    // Get the current host
    let currentHost = window.location.origin;

    // Construct the URL for the JSON file based on the selected version and current host
    let jsonUrl;

    if (window.location.hostname === '127.0.0.1') {
        if (window.location.pathname.includes('/dist/')) {
            jsonUrl = currentHost + "/dist/" + selectedVersion + ".json";
        } else if (window.location.pathname.includes('/src/')) {
            jsonUrl = currentHost + "/src/" + selectedVersion + ".json";
        } else {
            // Default to '/src/' for localhost if neither '/dist/' nor '/src/' is found
            jsonUrl = currentHost + "/src/" + selectedVersion + ".json";
        }
    } else {
        // Production environment
        jsonUrl = currentHost + "/sfia/" + selectedVersion + ".json";
    }

    // Use Fetch API for making the request
    fetch(jsonUrl)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            // Handle the downloaded JSON data here
            console.log("Downloaded JSON data:", data);

            const selectElement = document.getElementById("jsonVersionSelect");
            if (selectElement) {
                const options = Array.from(selectElement.options);
                options.forEach(option => {
                    option.setAttribute(
                        "data-selected",
                        option.value === selectedVersion
                    );
                });
            } else {
                console.error("jsonVersionSelect element not found.");
            }
            // Call the function to initialize SFIA content with the new JSON data
            initializeSFIAContent(data);
            // Call the function to set up event listeners
            setupEventListeners(data);

        })
        .catch(error => {
            // Log any errors that occurred during the request
            console.error('There was a problem with the fetch request:', error);
        });
}

// EOF: src/jsonHandling.js
;// src/urlHandling.js

// This file includes functions for generating and updating URL hashes based on LoR data and SFIA checkboxes.


/**
 * Update the URL hash based on filtered SFIA data.
 * @param {Object} filteredData - Filtered SFIA data.
 * @param {boolean} updateHash - Flag to indicate whether to update the URL hash.
 */
function updateSfiaUrlHash(filteredData, updateHash) {
    if (updateHash) {
        const urlHash = Object.values(filteredData).flatMap(category =>
            Object.values(category).flatMap(subCategory =>
                Object.values(subCategory).map(skill => {
                    const skillLevels = Object.keys(skill["levels"]).map(level =>
                        `${skill["code"]}-${level}`
                    );
                    return skillLevels.join("+");
                })
            )
        );
        g_sfiahash = urlHash.join("+");
        updateCombinedUrlHash();


    }
}

/**
 * Updates the URL with the combined SFIA and LoR hashes.
 * If both SFIA and LoR hashes are present, combines them with "&&" as a separator.
 * If only the SFIA hash is present, sets the URL hash to the SFIA hash.
 * If only the LoR hash is present, sets the URL hash to the LoR hash.
 */
function updateCombinedUrlHash() {

    if (g_sfiahash && g_lorhash) {
        window.location.hash = g_sfiahash + "&&" + g_lorhash;
    } else if (g_sfiahash) {
        /**
         * If only the SFIA hash is present, set the URL hash to the SFIA hash.
         */
        window.location.hash = g_sfiahash;
    } else if (g_lorhash) {
        /**
         * If only the LoR hash is present, set the URL hash to the LoR hash.
         * Note that we add "&&" before the LoR hash, as the URL can't start with "&&"
         */
        window.location.hash = "&&" + g_lorhash;
    }
    else{
        window.location.hash = "";
    }
}

/**
 * Updates the URL with the selected Levels of Responsibility (LoR) checkboxes.
 * This function retrieves all LoR checkboxes on the page, filters them to only include
 * the checked ones, retrieves their 'id' attribute, and joins them with '+' as a separator.
 * The resulting string is then set as the URL hash.
 * 
 * @param {string} hash - The combined LoR hash string.
 */
function updateURLWithLorCheckboxes(hash) {
    // Retrieve all LoR checkboxes on the page.
    const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');

    // Filter the checkboxes to only include the checked ones.
    const selectedLorCheckboxes = Array.from(lorCheckboxes)
        .filter(checkbox => checkbox.checked)
        // Retrieve the 'id' attribute of each checked LoR checkbox.
        .map(checkbox => checkbox.value);

    // Join the selected LoR checkboxes with '+' as a separator and set it as the URL hash.
    g_lorhash = selectedLorCheckboxes.join('+');

    // Join the selected LoR checkboxes with '+' as a separator and set it as the URL hash.

    updateCombinedUrlHash();
}

// src/urlHandling.js

/**
 * Generate URL hash based on combined LoR and SFIA data.
 * 
 * @param {Object} lorJson - The LoR JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @returns {string} - Combined URL hash string.
 */
function generateUrlHash(lorJson, sfiaJson) {
    const lorHash = generateLorHash(lorJson);
    const sfiaHash = generateSfiaHash(sfiaJson);
    return `${lorHash}+${sfiaHash}`; // Combine LoR and SFIA hashes
}

// src/urlHandling.js

/**
 * Generate URL hash based on LoR data.
 * 
 * @param {Object} lorJson - The LoR JSON data.
 * @returns {string} - LoR URL hash string.
 */
function generateLorHash(lorJson) {
    const urlHash = [];

    for (const { lorCategory, lorLevel } of lorJson) {
        urlHash.push(`${lorCategory}-${lorLevel}`);
    }

    return urlHash.join("+");
}

// src/urlHandling.js

/**
 * Generate URL hash based on SFIA data.
 * 
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @returns {string} - SFIA URL hash string.
 */
function generateSfiaHash(sfiaJson) {
    const urlHash = [];

    for (const category in sfiaJson) {
        for (const subCategory in sfiaJson[category]) {
            for (const skill in sfiaJson[category][subCategory]) {
                const skillCode = sfiaJson[category][subCategory][skill]["code"];
                const skillLevels = Object.keys(sfiaJson[category][subCategory][skill]["levels"]).join('+');
                urlHash.push(`${skillCode}-${skillLevels}`);
            }
        }
    }

    return urlHash.join("+");
}
;// src/eventListeners.js

// This file contains a function to set up event listeners for exporting data and triggering rendering of the SFIA content.

/**
 * Function to set up event listeners for exporting data and triggering rendering of the SFIA content.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
function setupEventListeners(sfiaJson) {
    try {
        // Log buttons to the console for debugging
        const exportCSVButton = document.getElementById("exportCSV"); // Button for exporting data to CSV
        const exportHTMLButton = document.getElementById("exportHTML"); // Button for exporting data to HTML

        // Check if buttons exist before adding event listeners
        if (exportCSVButton) {
            console.info("Export CSV button found.");
            exportCSVButton.addEventListener("click", function (event) {
                event.preventDefault();
                if (new Date().getTime() - lastExportTime < 3000) {
                    console.log("Export CSV skipped due to timeout.");
                    return;
                }
                lastExportTime = new Date().getTime();
                exportCSV(event, sfiaJson);
            });
        } else {
            console.error("Export CSV Button not found.");
        }

        if (exportHTMLButton) {
            console.info("Export HTML button found.");

            // Add event listener for exporting data to HTML
            exportHTMLButton.addEventListener("click", function (event) {
                event.preventDefault();
                if (new Date().getTime() - lastExportTime < 3000) {
                    console.log("Export HTML skipped due to timeout.");
                    return;
                }
                lastExportTime = new Date().getTime();

                // Perform UI updates or other necessary actions
                // Do not call exportHTML directly from here
            });
        } else {
            console.error("Export HTML Button not found.");
        }
    } catch (error) {
        console.error(
            "Error setting up event listeners:",
            error
        );
    }
}
;// BOF: src/windowEvents.js

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
                prompt: "Reword the following questions for clarity and provide additional thought-provoking questions with examples where relevant. Only output the questions and examples—no introductions, explanations, or concluding remarks.\n\n" + formattedContent,
                max_tokens: 1000
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
                showNotification('Error saving API keys: ' + error.message, 'error', 5000);
            }
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

// API Key Management code moved inside DOMContentLoaded

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

// Notification usage examples moved to appropriate event handlers in DOMContentLoaded

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
