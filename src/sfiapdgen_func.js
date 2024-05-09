
// src/browserUpdate.js

// This file contains the code for appending a script tag to the document body, loading the Browser Update script

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
;// src/dataFetching.js

// This file includes functions for asynchronously fetching data from a given URL.

/**
 * Asynchronously fetches data from a given URL.
 * 
 * @param {string} url - The URL to fetch data from.
 * @return {Promise} A Promise that resolves to the parsed JSON response.
 * @throws {Error} If the HTTP response is not ok.
 */
async function fetchData(url) {
    try {
        // Fetch the data from the given URL
        const response = await fetch(url);

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            // Throw an error with the HTTP status code
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response body as JSON and return it
        return await response.json();
    } catch (error) {
        // Log any errors that occur during the fetch or parsing process
        console.error('Error fetching data:', error);
    }
}

/**
 * Retrieves the value of a cookie by its name.
 * @param {string} name - The name of the cookie.
 * @returns {string|undefined} The value of the cookie, or undefined if not found.
 */
function getCookie(name) {
    // Prepend a semicolon and the document's cookie value.
    const value = `; ${document.cookie}`;

    // Split the value based on the cookie name and a semicolon.
    const parts = value.split(`; ${name}=`);

    // If the array has a length of 2, return the value after the cookie name.
    // Otherwise, return undefined.
    if (parts.length === 2) {
        // Extract the value of the cookie by removing the trailing semicolon and any following characters.
        return parts.pop().split(';').shift();
    }
}


/**
 * Sets the stored version based on the provided value.
 * @param {string} storedVersion - The version to be stored.
 */
function setStoredVersion(storedVersion) {
    // Get the stored version from the cookie, if any
    let storedVersionFromCookie = getCookie("selectedVersion");

    // If no stored version is found in the cookie, use the provided storedVersion
    if (!storedVersionFromCookie) {
        storedVersionFromCookie = storedVersion;
    }

    // Set the selected version in the dropdown
    let dropdown = document.getElementById("jsonVersionSelect");
    dropdown.value = storedVersionFromCookie;

    // Trigger the changeJsonVersion function to download the selected version
    changeJsonVersion();  // Remove await here

    // Fetch the selected version JSON data
    const sfiaJson = fetchData(storedVersionFromCookie + ".json");  // Remove await here

    // Call the function to set up event listeners
    setupEventListeners(sfiaJson);
}
;// src/constants.js

// This file contains constant variables or configuration values used throughout the project.

let sfiaJson;  // declare sfiaJson at a higher scope
let lorJson; // declare lorJson at a higher scope
let lastExportTime = 0; // Initialize lastExportTime to 0
const $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };
const SELECTED_VERSION = "selectedVersion";
;// src/exportFunctions.js

// This file includes functions for exporting checked box data to a CSV file and exporting the HTML content to a downloadable HTML file.

/**
 * Function to export checked box data to a CSV file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
function exportCSV(event, sfiaJson) {
    // Log the function trigger and the event object
    console.log('Export CSV triggered');
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

    // Get all the checked checkboxes
    const checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');

    // Initialize an empty array to store the CSV data
    const data = [];

    // Loop through each checked checkbox
    for (const box of checkedBoxes) {
        // Parse the JSON data from the checkbox
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));

        // Check if required properties exist before accessing them
        const categoryData = sfiaJson[jsonData.category];
        const subCategoryData = categoryData?.[jsonData.subCategory];
        const skillData = subCategoryData?.[jsonData.skill];

        // If all required data exists
        if (categoryData && subCategoryData && skillData) {
            const skillCode = skillData["code"];
            const skillDescription = skillData["description"];
            const skillLevel = skillData["levels"]?.[jsonData.level];

            // If all required skill data exists
            if (skillCode && skillDescription && skillLevel) {
                // Add the data to the array
                data.push([
                    `${jsonData.skill} ${skillCode}-${jsonData.level}`,
                    skillDescription,
                    skillLevel
                ]);
            } else {
                // Log an error if required skill data is missing
                console.error(`Incomplete or missing data for ${jsonData.category}/${jsonData.subCategory}/${jsonData.skill}`);
            }
        } else {
            // Log an error if required category or subcategory data is missing
            console.error(`Skill data not found for ${jsonData.category}/${jsonData.subCategory}/${jsonData.skill}`);
        }
    }

    // Convert the data array to a CSV string
    const csvContent = data.map(infoArray => `"${infoArray.join('","')}"`).join("\n");

    // Create a download link for the CSV file
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/csv,' + encodedUri;
    a.download = 'PositionSummary.csv';

    // Append the link to the body, trigger the click event, and remove the link
    document.body.appendChild(a);
    a.click();
    a.remove();
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
;// src/checkboxHandling.js

// This file contains functions for checking if a specific SFIA skill level is present in the URL hash and generating table cells with checkboxes.

/**
 * Checks if a specific sfia skill level is present in the URL hash.
 *
 * @param {string} code - The code of the skill.
 * @param {number} level - The level of the skill.
 * @return {boolean} True if the level is present in the URL hash, false otherwise.
 */
function checkSfiaPreselected(code, level) {
    // Check if the URL hash exists and is not empty
    if (window.location.hash) {
        // Get the levels from the URL hash
        var hashLevels = window.location.hash.substring(1).split("+");
        // Iterate through the levels in reverse order
        for (var i = hashLevels.length - 1; i >= 0; i--) {
            // Get the code and level from the current level
            var hashLevel = hashLevels[i].split("-");
            var check_code = hashLevel[0];
            var check_level = parseInt(hashLevel[1]);

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
;//initializeContent.js

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


// Lor content below


/**
 * Fetches and displays Levels of Responsibility data from the 'sfia-lors-8.json' file.
 * This function retrieves the data, clears any existing content in the table,
 * and then appends new rows to the table for each data item.
 * adds a tool tip to each of the checkboxes based onthe description attribute of the lor
 */
async function initializeLorContent() {
    try {
        // Fetch LOR JSON data
        const response = await fetch('json-sfia-lors-v8.json');
        const lorJson = await response.json();

        // Clear existing content in the LOR table body
        const lorContent = document.getElementById('sfia-lors-content');
        lorContent.innerHTML = '';
        console.log('LOR content cleared');

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
            lorContent.appendChild(row);
            console.log('LOR row added');

            // Add a click event listener to each LOR checkbox
            const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');
            lorCheckboxes.forEach(function (checkbox) {
                checkbox.addEventListener('click', function () {
                    console.log('Checkbox clicked:', checkbox.id);
                    renderLorOutput(lorJson, false);
                }, false);
            });
            console.log('LOR checkbox event listener added');
        });
        console.log('LOR content initialized');

    } catch (error) {
        console.error('Error fetching or displaying LOR data:', error);
    }
    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        renderLorOutput(lorJson, false);
    }
}
;// src/tableRendering.js

// This file includes functions for rendering the output HTML based on the selected checkboxes and the provided SFIA JSON data.

/**
 * Render the output HTML based on the selected checkboxes and the provided SFIA JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @param {boolean} updateHash - Flag to indicate whether to update the URL hash.
 */
function renderSfiaOutput(sfiaJson, updateHash = true) {

    // Get all the checked checkboxes
    const sfiacheckedBoxes = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]:checked');

    // Create a new JSON object to store the filtered data
    const newJson = sfiaJson;
    const newArr = {};

    // Create an array to store the URL hash parts
    const urlHash = [];

    if (sfiacheckedBoxes) {
        // Loop through each checked checkbox
        for (const box of sfiacheckedBoxes) {
            // Parse the JSON data from the checkbox
            const jsonData = JSON.parse(box.getAttribute('sfia-data'));

            // Create a nested structure in newArr based on the JSON data
            newArr[jsonData.category] ??= {};
            newArr[jsonData.category][jsonData.subCategory] ??= {};
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill] ??= {
                description: newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.description,
                code: newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.code,
                levels: {},
            };

            // Add the skill level data to newArr
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level] = newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.levels?.[jsonData.level];

            // Add the skill code and level to the URL hash array
            urlHash.push(`${newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.code}-${jsonData.level}`);
        }
    }
    // Get the HTML element to render the output
    const html = document.getElementById('sfia-output');
    html.innerHTML = ''; // Clear HTML content

    // Render the filtered data in the HTML
    for (const category in newArr) {
        // Render category heading
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = category;
        html.appendChild(categoryEle);

        // Render sub-category headings and skill information
        for (const subCategory in newArr[category]) {
            const subCategoryEle = document.createElement('h2');
            subCategoryEle.textContent = subCategory;
            html.appendChild(subCategoryEle);

            for (const skill in newArr[category][subCategory]) {
                const skillEle = document.createElement('h3');
                skillEle.textContent = `${skill} - ${newArr[category][subCategory][skill]["code"]}`;
                html.appendChild(skillEle);

                const skillDescriptionEle = document.createElement('p');
                skillDescriptionEle.textContent = newArr[category][subCategory][skill]["description"];
                html.appendChild(skillDescriptionEle);

                // Render skill level information
                for (const level in newArr[category][subCategory][skill]["levels"]) {
                    const levelEle = document.createElement('h4');
                    levelEle.textContent = `Level ${level}`;
                    html.appendChild(levelEle);

                    const levelDescriptionEle = document.createElement('p');
                    levelDescriptionEle.textContent = newArr[category][subCategory][skill]["levels"][level];
                    html.appendChild(levelDescriptionEle);
                }
            }
        }
    }

    // Update the URL hash if updateHash is true
    if (updateHash) {
        window.location.hash = urlHash.join("+");
    }
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
    updateHash = generateUrlHash(newLorJson);
    console.log("updateHash:", updateHash);

    console.log("Updating URL hash if necessary");
    if (updateHash) {
        console.log("Updating URL hash");
        updateURLWithLorCheckboxes(updateHash);
    }

    console.log("Exiting renderLorOutput function");
}
;
/**
 * Fetches and displays Levels of Responsibility data from the 'sfia-lors-8.json' file.
 * This function retrieves the data, clears any existing content in the table,
 * and then appends new rows to the table for each data item.
 * adds a tool tip to each of the checkboxes based onthe description attribute of the lor
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
;// src/utilityFunctions.js

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
;// src/jsonHandling.js

// This file contains a function to change the JSON version based on the selected value from a dropdown.

/**
 * Change the JSON version based on the selected value from the dropdown.
 * This function fetches the JSON data from the specified URL and initializes
 * the SFIA content and event listeners with the new JSON data.
 */
function changeJsonVersion() {

    // Get the selected value from the dropdown
    let selectedVersion = document.getElementById("jsonVersionSelect").value;

    // Set a cookie to remember the selected version
    document.cookie = "selectedVersion=" + selectedVersion;

    // Get the current host
    let currentHost = window.location.origin;

    // Construct the URL for the JSON file based on the selected version and current host
    //let jsonUrl = currentHost + "/src/" + selectedVersion + ".json";
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
;// src/urlHandling.js

// This file includes functions for generating and updating URL hashes based on LoR data and SFIA checkboxes.

/**
 * Generate URL hash based on LoR data.
 * 
 * @param {Array} newLorJson - Array containing LoR data objects.
 * @returns {string} - URL hash string.
 */
function generateUrlHash(newLorJson) {
    console.log("Entering generateUrlHash function");
    // Initialize an empty array to store LoR category-level pairs
    const urlHash = [];

    console.log("newLorJson:", newLorJson);

    // Loop through the newLorJson array and add LoR category-level pairs to the urlHash array
    for (const { lorCategory, lorLevel } of newLorJson) {
        console.log(`Adding ${lorCategory}-${lorLevel} to urlHash`);
        urlHash.push(`${lorCategory}-${lorLevel}`);
    }

    console.log("urlHash:", urlHash);

    // Return the URL hash string
    const urlHashStr = urlHash.join("+");
    console.log("Returning urlHashStr:", urlHashStr);
    return urlHashStr;
}

/**
 * Update URL hash based on LoR data.
 * 
 * @param {Array} newLorJson - Array containing LoR data objects.
 */
function updateURLWithSfiaCheckboxes(newLorJson) {
    console.log("Entering updateURLWithSfiaCheckboxes function");
    console.log("newLorJson:", newLorJson);
    const urlHashStr = generateUrlHash(newLorJson);
    console.log("Generated urlHashStr:", urlHashStr);
    window.location.hash = urlHashStr;
    console.log("URL hash updated to:", urlHashStr);
}

/**
 * Updates the URL with the selected Levels of Responsibility (LoR) checkboxes.
 * 
 * This function retrieves all LoR checkboxes on the page, filters them to only include
 * the checked ones, retrieves their 'id' attribute, and joins them with '+' as a separator.
 * The resulting string is then set as the URL hash.
 */
function updateURLWithLorCheckboxes() {
    // Retrieve all LoR checkboxes on the page.
    const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');

    // Filter the checkboxes to only include the checked ones.
    const selectedLorCheckboxes = Array.from(lorCheckboxes)
        .filter(checkbox => checkbox.checked)
        // Retrieve the 'id' attribute of each checked LoR checkbox.
        .map(checkbox => checkbox.value);

    // Join the selected LoR checkboxes with '+' as a separator and set it as the URL hash.
    const urlHash = selectedLorCheckboxes.join('+');
    window.location.hash = urlHash;
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
;// src/windowEvents.js

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
        // Set the stored version
        await setStoredVersion("json_source_v8");

        // Initialize SFIA content
        await initializeSFIAContent(sfiaJson);
        // Initialize LOR content
        await initializeLorContent();

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
    } catch (error) {
        console.error('An error occurred during the onload function:', error.message);
    }
};
