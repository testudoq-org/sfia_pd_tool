"use strict";
let sfiaJson;  // declare sfiaJson at a higher scope
/* //browser
let $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };



function $buo_f() {
    let e = document.createElement("script");
    e.src = "https:////browser-update.org/update.min.js";
    document.body.appendChild(e);
}

try {
    document.addEventListener("DOMContentLoaded", $buo_f, false);
} catch (e) {
    window.attachEvent("onload", $buo_f);
}
*/

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function checkPreselected(code, level) {
    console.log("Checking URL hash for preselected data");
    const urlHash = window.location.href.split("/#/")[1];
    console.log(`URL hash: ${urlHash}`);
    if (urlHash && urlHash.split("-").length > 0) {
        console.log("URL hash found, checking for preselected data");
        const hashParts = urlHash.split("-");
        console.log(`Hash parts: ${hashParts}`);
        for (let i = hashParts.length - 1; i >= 0; i--) {
            const [checkCode, checkLevel] = hashParts[i].split("-");
            console.log(`Checking code: ${checkCode}, level: ${checkLevel}`);
            if (code === checkCode && level === checkLevel) {
                console.log(`Preselected data found: ${code}-${level}`);
                return true;
            }
        }
    }
    console.log("No preselected data found");
    return false;
}

function addSelectionBox(index, sfiaJson, rootKey, subKey, skillKey) {
    const col = document.createElement('td');
    if (sfiaJson[rootKey][subKey][skillKey]["levels"].hasOwnProperty(index)) {
        const jsonData = JSON.stringify({
            "category": rootKey,
            "subCategory": subKey,
            "skill": skillKey,
            "level": index
        });
        const checked = checkPreselected(sfiaJson[rootKey][subKey][skillKey]["code"], index) ? "checked" : "";
        col.innerHTML = `<input type='checkbox' title='${sfiaJson[rootKey][subKey][skillKey]["levels"][index]}' sfia-data='${jsonData}' data-code='${sfiaJson[rootKey][subKey][skillKey]["code"]}' data-level='${index}' ${checked}/>`;
        col.className += " select_col";
    } else {
        col.innerHTML = "<input type='checkbox' disabled/>";
        col.className += " no_select_col";
    }
    col.className += " col-checkbox";
    return col;
}


function exportCSV(event, sfiaJson) {
    console.log('Export CSV triggered');
    event.preventDefault();  // Prevent the default action associated with the event
    console.log('Event:', event);
    console.log('sfiaJson:', sfiaJson);

    const checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    const data = [];

    for (const box of checkedBoxes) {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));

        // Check if required properties exist before accessing them
        const categoryData = sfiaJson[jsonData.category];
        const subCategoryData = categoryData?.[jsonData.subCategory];
        const skillData = subCategoryData?.[jsonData.skill];

        if (categoryData && subCategoryData && skillData) {
            const skillCode = skillData["code"];
            const skillDescription = skillData["description"];
            const skillLevel = skillData["levels"]?.[jsonData.level];

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
    }

    const csvContent = data.map(infoArray => `"${infoArray.join('","')}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/csv,' + encodedUri;
    a.download = 'PositionSummary.csv';

    document.body.appendChild(a);
    a.click();
    a.remove();
}

function exportHTML(event, sfiaJson) {
    console.log('Export HTML button triggered');
    console.log('Event:', event);
    event.preventDefault();  // Prevent the default action associated with the event
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

    const encodedUri = encodeURI(htmlContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/plain;charset=utf-8,' + encodedUri;
    a.download = truncatedFilename;

    document.body.appendChild(a);
    a.click();
    a.remove();
}

function changeJsonVersion() {
    console.log('[changeJsonVersion] Start');

    // Get the selected value from the dropdown
    let selectedVersion = document.getElementById("jsonVersionSelect").value;
    console.log('[changeJsonVersion] Selected version:', selectedVersion);

    // Set a cookie to remember the selected version
    document.cookie = `selectedVersion=${selectedVersion}; SameSite=None; Secure`;
    console.log('[changeJsonVersion] Cookie set to:', `selectedVersion=${selectedVersion}`);

    // Get the current host
    let currentHost = window.location.origin;
    console.log('[changeJsonVersion] Current host:', currentHost);

    // Construct the URL for the JSON file based on the selected version and current host
    let jsonUrl = `${selectedVersion}.json`;
    console.log('[changeJsonVersion] JSON URL:', jsonUrl);

    // Use Fetch API for making the request
    console.log('[changeJsonVersion] Fetching JSON data...');
    fetch(jsonUrl)
        .then(response => {
            console.log('[changeJsonVersion] Response received');
            if (!response.ok) {
                throw new Error(`[changeJsonVersion] HTTP error! Status: ${response.status}`);
            }
            console.log('[changeJsonVersion] Response OK');
            return response.json();
        })
        .then(data => {
            console.log('[changeJsonVersion] JSON data received:', data);

            // Call the function to initialize SFIA content with the new JSON data
            console.log('[changeJsonVersion] Initializing SFIA content...');
            initializeSFIAContent(data);

            // Call the function to set up event listeners
            console.log('[changeJsonVersion] Setting up event listeners...');
            setupEventListeners(data);
        })
        .catch(error => {
            console.error('[changeJsonVersion] Fetch request error:', error);
        });

    console.log('[changeJsonVersion] End');
}

/**
 * Render the output based on the provided SFIA JSON data.
 *
 * @param {Object} sfiaJson - The SFIA JSON data to render.
 * @param {boolean} [updateHash=true] - Flag indicating whether to update the URL hash.
 */
function renderOutput(sfiaJson, updateHash = true) {
    // Array to store selected skill codes and levels for updating the URL hash
    const urlHash = [];

    // Parse the URL hash to extract selected skill codes and levels
    const urlHashParts = window.location.hash.replace('#', '').split('-'); // Split the URL hash into parts
    console.log('URL hash parts:', urlHashParts);

    // Filter out 'undefined' and empty strings
    const filteredUrlHash = urlHashParts.filter(part => part !== 'undefined' && part !== '');
    console.log('Filtered URL hash parts:', filteredUrlHash);

    // Generate the URL hash
    for (const hashPart of filteredUrlHash) {
        const [code, level] = hashPart.split('-'); // Split the hash part into code and level
        if (code !== 'undefined' && level !== 'undefined') { // Check if code and level are not 'undefined'
            urlHash.push(`${code}-${level}`); // Add the skill code and level to the URL hash
        }
    }
    console.log('URL hash:', urlHash);

    // Create a new JSON object to store the selected data
    const newArr = {};

    // Loop through the checked boxes
    const checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    for (const box of checkedBoxes) {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));

        // Ensure all data is defined
        if (jsonData.category && jsonData.subCategory && jsonData.skill && jsonData.level) {
            newArr[jsonData.category] ??= {};
            newArr[jsonData.category][jsonData.subCategory] ??= {};
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill] ??= {
                description: sfiaJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.description,
                code: sfiaJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.code,
                levels: {},
            };

            // Add the selected skill level to the new JSON object
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level] = sfiaJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.levels?.[jsonData.level];

            // Check if the current checkbox corresponds to a skill code and level from the URL hash
            if (urlHash.includes(`${jsonData.skill}-${jsonData.level}`)) {
                box.checked = true; // Select the checkbox
            }
        } else {
            console.error('Incomplete or missing data:', jsonData);
        }
    }

    // Clear the HTML content
    const html = document.getElementById('sfia-output');
    html.innerHTML = '';
    console.log('HTML cleared');

    // Generate the HTML based on the new JSON object
    for (const category in newArr) {
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = category;
        html.appendChild(categoryEle);
        console.log(`Created ${category} heading`);

        for (const subCategory in newArr[category]) {
            const subCategoryEle = document.createElement('h2');
            subCategoryEle.textContent = subCategory;
            html.appendChild(subCategoryEle);
            console.log(`Created ${subCategory} sub-heading`);

            for (const skill in newArr[category][subCategory]) {
                const skillEle = document.createElement('h3');
                skillEle.textContent = `${skill} - ${newArr[category][subCategory][skill]["code"]}`;
                html.appendChild(skillEle);
                console.log(`Created ${skill} heading`);

                const skillDescriptionEle = document.createElement('p');
                skillDescriptionEle.textContent = newArr[category][subCategory][skill]["description"];
                html.appendChild(skillDescriptionEle);
                console.log(`Created ${skill} description`);

                for (const level in newArr[category][subCategory][skill]["levels"]) {
                    const levelEle = document.createElement('h4');
                    levelEle.textContent = `Level ${level}`;
                    html.appendChild(levelEle);
                    console.log(`Created level ${level} heading`);

                    const levelDescriptionEle = document.createElement('p');
                    levelDescriptionEle.textContent = newArr[category][subCategory][skill]["levels"][level];
                    html.appendChild(levelDescriptionEle);
                    console.log(`Created level ${level} description`);
                }
            }
        }
    }

    // Highlight selected checkboxes visually
    //  checkedBoxes.forEach(box => {
    //     box.parentNode.style.backgroundColor = 'lightblue';
    //   });

    // Join the URL hash parts with '-', then update the hash part of the URL only if updateHash is true and urlHash is not empty
    console.log('At the end of render output,Value of updateHash:', updateHash);
    console.log('At the end of render output, Filtered URL hash:', filteredUrlHash);
    if (updateHash && urlHash.length > 0) {
        window.location.hash = filteredUrlHash.join("-");
        console.log(`At the end of render output,Updated URL hash to ${filteredUrlHash.join("-")}`);
    }

    console.log('End of renderOutput function');
}


// Function to set up event listeners
function setupEventListeners(sfiaJson) {
    try {
        // Log buttons to the console for debugging
        const exportCSVButton = document.getElementById('exportCSV');
        const exportHTMLButton = document.getElementById('exportHTML');

        // Check if buttons exist before adding event listeners
        if (exportCSVButton) {
            console.info('Export CSV triggered.');
            exportCSVButton.addEventListener('click', function (event) {
                event.preventDefault();
                exportCSV(event, sfiaJson);
            });
        } else {
            console.error('Export CSV Button not found.');
        }

        if (exportHTMLButton) {
            console.info('Export HTML triggered.');
            exportHTMLButton.addEventListener('click', function (event) {
                event.preventDefault();
                exportHTML(event, sfiaJson);
            });
        } else {
            console.error('Export HTML Button not found.');
        }

        // Add event listener for checkboxes to update the URL
        const checkboxes = document.querySelectorAll('input[type=checkbox]');
        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener('click', updateURLWithCheckboxes);
        });
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

async function initializeSFIAContent(sfiaJson) {
    try {
        const rootKeyPrinted = [];
        const subKeyPrinted = [];

        const table = document.getElementById('sfia-content');
        table.innerHTML = ''; // Clear existing content before populating with new data

        for (const rootKey in sfiaJson) {
            for (const subKey in sfiaJson[rootKey]) {
                for (const skillKey in sfiaJson[rootKey][subKey]) {
                    const row = document.createElement('tr');
                    row.className += " " + rootKey.trim().replace(/ /g, "_").toLowerCase();

                    const col1 = document.createElement('td');
                    if (rootKeyPrinted.indexOf(rootKey) === -1) {
                        rootKeyPrinted.push(rootKey);
                        col1.textContent = rootKey;
                    }
                    col1.className += " root_key";
                    row.appendChild(col1);

                    const col2 = document.createElement('td');
                    if (subKeyPrinted.indexOf(subKey) === -1) {
                        subKeyPrinted.push(subKey);
                        col2.textContent = subKey;
                    }
                    col2.className += " sub_key";
                    row.appendChild(col2);

                    const col3 = document.createElement('td');
                    col3.className += " skill_key";
                    row.appendChild(col3);

                    const skillSpan = document.createElement('span');
                    skillSpan.textContent = skillKey + " - " + sfiaJson[rootKey][subKey][skillKey]["code"];
                    skillSpan.title = sfiaJson[rootKey][subKey][skillKey]["description"];
                    col3.appendChild(skillSpan);

                    for (let i = 1; i < 8; i++) {
                        row.appendChild(addSelectionBox(i, sfiaJson, rootKey, subKey, skillKey));
                    }

                    table.appendChild(row); // add entire row to table.
                }
            }
        }

        if (window.location.href.split("/#/").length > 0) {
            renderOutput(sfiaJson, false);
        }

        const checkboxes = document.querySelectorAll('input[type=checkbox]');
        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener('click', function () {
                renderOutput(sfiaJson);
            });
        });

    } catch (error) {
        console.error('Error initializing SFIA content:', error);
    }
}


function searchForText() {
    try {
        // Get user input and filter value
        const input = document.getElementById('myInput');
        if (!input) {
            console.error("Input element not found.");
            return;
        }
        const filterValue = input.value.toUpperCase();

        // Get table body and rows
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

        // Loop through rows and show/hide based on filter
        for (let i = 0; i < tableRows.length; i++) {
            const skillKey = tableRows[i].getElementsByClassName("skill_key")[0];
            if (!skillKey) {
                console.error(`Skill key element not found for row ${i}.`);
                continue; // Skip this row
            }
            const skillText = skillKey.textContent;
            if (skillText.toUpperCase().includes(filterValue)) {
                tableRows[i].style.display = "";
            } else {
                tableRows[i].style.display = "none";
            }
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}
// Update the URL with the selected checkboxes
function updateURLWithCheckboxes() {
    console.log('Updating URL with selected checkboxes');

    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    const selectedCheckboxes = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => {
            console.log(`Checkbox ${checkbox.getAttribute('data-code')}-${checkbox.getAttribute('data-level')} is selected`);
            return checkbox.getAttribute('data-code') + '-' + checkbox.getAttribute('data-level');
        });

    const urlHash = selectedCheckboxes.join('-');
    console.log(`Setting URL hash to ${urlHash}`);
    window.location.hash = urlHash;
    console.log('URL updated');
}

//get cookie info
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// On page load, check if there's a stored version in the cookie
window.onload = async function () {
    console.groupCollapsed('Page Load');

    try {
        console.log('Window onload function triggered');

        console.group('Checking for stored version in cookie');
        let storedVersion = getCookie("selectedVersion");

        if (!storedVersion) {
            console.log('No stored version found, setting to latest version');
            storedVersion = "json_source_v8-min";
        }

        console.log(`Stored version: ${storedVersion}`);
        console.groupEnd();

        console.group('Updating dropdown with stored version');
        let dropdown = document.getElementById("jsonVersionSelect");
        if (!dropdown) {
            console.error('Dropdown element not found');
        } else {
            dropdown.value = storedVersion;
            console.log(`Dropdown value updated to ${dropdown.value}`);
        }
        console.groupEnd();

        console.group('Triggering changeJsonVersion function');
        await changeJsonVersion();
        console.groupEnd();

        console.group('Fetching selected version JSON data');
        console.log(`Stored version: ${storedVersion}`);
        const sfiaJson = await fetchData(`/${storedVersion}.json`);
        if (!sfiaJson) {
            console.error('Failed to fetch JSON data');
        } else {
            console.log('JSON data fetched successfully');
        }
        console.groupEnd();

        console.group('Calling setupEventListeners function');
        setupEventListeners(sfiaJson);
        console.groupEnd();

        console.group('Parsing URL hash and pre-selecting checkboxes');
        const urlHash = window.location.hash.replace('#', '');
        if (urlHash.length === 0) {
            console.log('No URL hash found.');
        } else {
            console.log('URL hash:', urlHash);
        }

        const selectedCheckboxes = urlHash.split('+');
        console.log(`Found ${selectedCheckboxes.length} selected checkboxes`);

        selectedCheckboxes.forEach(selectedCheckbox => {
            console.log(`Processing selected checkbox ${selectedCheckbox}`);
            const [code, level] = selectedCheckbox.split('-');
            const checkbox = document.querySelector(`input[type=checkbox][data-code="${code}"][data-level="${level}"]`);
            if (checkbox) {
                checkbox.checked = true;
                console.log(`Checked checkbox for ${code}-${level}`);
            } else {
                console.log(`Could not find checkbox for ${code}-${level}`);
            }
        });
        console.groupEnd();

        console.group('Triggering renderOutput function');
        renderOutput(sfiaJson);
        console.groupEnd();

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
    console.groupEnd();
};


// Check if the URL hash changes (e.g., due to user interaction)
window.addEventListener('hashchange', async function () {
    try {
        // Fetch the selected version JSON data
        let storedVersion = getCookie("selectedVersion");

        if (!storedVersion) {
            console.log('No stored version found, setting to latest version');
            storedVersion = "json_source_v8-min";
        }

        sfiaJson = await fetchData(storedVersion + ".json");  // update sfiaJson

        // Call the function to initialize SFIA content
        initializeSFIAContent(sfiaJson);

        // Trigger the renderOutput function or any other logic needed after checkboxes are pre-selected
        renderOutput(sfiaJson);
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
});

// Checkbox click event handling
function handleCheckboxClick(event) {
    try {
        const checkbox = event.target;
        const jsonData = JSON.parse(checkbox.getAttribute('sfia-data'));
        const skillCodeLevel = `${jsonData.skill}-${jsonData.level}`;

        // Update URL hash based on checkbox state
        if (checkbox.checked) {
            urlHash.push(skillCodeLevel);
        } else {
            const index = urlHash.indexOf(skillCodeLevel);
            if (index !== -1) {
                urlHash.splice(index, 1);
            }
        }

        // Update URL hash
        updateUrlHash();
    } catch (error) {
        console.error('Error handling checkbox click event:', error);
    }
}

// Function to update URL hash
function updateUrlHash() {
    try {
        const checkedCheckboxes = document.querySelectorAll('input[type=checkbox]:checked');
        const selectedSkills = Array.from(checkedCheckboxes).map(checkbox => {
            const jsonData = JSON.parse(checkbox.getAttribute('sfia-data'));
            return `${jsonData.skill}-${jsonData.level}`;
        });
        if (selectedSkills.length > 0) {
            window.location.hash = selectedSkills.join('+');
        } else {
            window.location.hash = '';
        }
    } catch (error) {
        console.error('Error updating URL hash:', error);
    }
}


// Update checkboxes based on URL hash
function updateCheckboxes() {
    try {
        console.log('Updating checkboxes based on URL hash');
        const urlHashParts = window.location.hash.replace('#', '').split('-');
        console.log(`URL hash parts: ${urlHashParts}`);
        urlHashParts.forEach(hashPart => {
            const [skill, level] = hashPart.split('-');
            console.log(`Updating checkbox for skill: ${skill}, level: ${level}`);
            const checkbox = document.querySelector(`input[type=checkbox][sfia-data*="${skill}"][sfia-data*="${level}"]`);
            if (checkbox) {
                console.log(`Found checkbox for skill: ${skill}, level: ${level}`);
                checkbox.checked = true;
            } else {
                console.log(`No checkbox found for skill: ${skill}, level: ${level}`);
            }
        });
    } catch (error) {
        console.error('Error updating checkboxes based on URL hash:', error);
    }
}


// Check if the URL hash changes (e.g., due to user interaction)
window.addEventListener('hashchange', async function () {
    try {
        console.groupCollapsed('Hash Change Event');
        console.log('Parsing URL hash on page load');
        const urlHashParts = window.location.hash.replace('#', '').split('-');
        if (urlHashParts.length > 0 && urlHashParts[0] !== '') {
            console.group('URL Hash Parts');
            urlHashParts.forEach(part => {
                console.log(part);
                urlHash.push(part);
            });
            console.groupEnd();
            updateCheckboxes();
        }
        console.groupEnd();

        console.groupCollapsed('Fetching Selected Version JSON Data');
        console.log('Fetching selected version JSON data');
        sfiaJson = await fetchData(storedVersion + ".json");  // update sfiaJson
        if (sfiaJson) {
            console.log('JSON data fetched successfully');
        } else {
            console.error('Failed to fetch JSON data');
        }
        console.groupEnd();

        console.groupCollapsed('Initializing SFIA Content');
        console.log('Calling function to initialize SFIA content');
        initializeSFIAContent(sfiaJson);
        console.groupEnd();

        console.groupCollapsed('Rendering Output');
        console.log('Triggering renderOutput function');
        renderOutput(sfiaJson);
        console.groupEnd();
    } catch (error) {
        console.groupCollapsed('Error Occurred');
        console.error('An error occurred:', error.message);
        console.groupEnd();
    }
});

