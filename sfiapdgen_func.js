"use strict";
let sfiaJson;  // declare sfiaJson at a higher scope

let $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };

function $buo_f() {
    let e = document.createElement("script");
    e.src = "https:////browser-update.org/update.min.js";
    document.body.appendChild(e);
}

// Check if the hostname is 127.0.0.1 to skip the code
if (window.location.hostname !== '127.0.0.1') {
    try {
        document.addEventListener("DOMContentLoaded", $buo_f, false);
    } catch (e) {
        window.attachEvent("onload", $buo_f);
    }
}

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
    const urlHash = window.location.href.split("/#/")[1];
    if (urlHash && urlHash.split("+").length > 0) {
        const hashParts = urlHash.split("+");
        for (let i = hashParts.length - 1; i >= 0; i--) {
            const [checkCode, checkLevel] = hashParts[i].split("-");
            if (code === checkCode && level === checkLevel) {
                return true;
            }
        }
    }
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
        col.innerHTML = `<input type='checkbox' title='${sfiaJson[rootKey][subKey][skillKey]["levels"][index]}' sfia-data='${jsonData}' ${checked}/>`;
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
    // Get the selected value from the dropdown
    let selectedVersion = document.getElementById("jsonVersionSelect").value;

    // Set a cookie to remember the selected version
    document.cookie = "selectedVersion=" + selectedVersion;

    // Get the current host
    let currentHost = window.location.origin;

    // Construct the URL for the JSON file based on the selected version and current host
    let jsonUrl = currentHost + "/" + selectedVersion + ".json";

    // Use Fetch API for making the request
    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Handle the downloaded JSON data here
            console.log("Downloaded JSON data:", data);

            // Call the function to initialize SFIA content with the new JSON data
            initializeSFIAContent(data);
            // Call the function to set up event listeners
            setupEventListeners(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch request:', error);
        });
}


function renderOutput(sfiaJson, updateHash = true) {
    const checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    const newJson = sfiaJson;
    const newArr = {};
    const urlHash = [];

    for (const box of checkedBoxes) {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));

        newArr[jsonData.category] ??= {};
        newArr[jsonData.category][jsonData.subCategory] ??= {};
        newArr[jsonData.category][jsonData.subCategory][jsonData.skill] ??= {
            description: newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.description,
            code: newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.code,
            levels: {},
        };

        newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level] = newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.levels?.[jsonData.level];

        urlHash.push(`${newJson[jsonData.category]?.[jsonData.subCategory]?.[jsonData.skill]?.code}-${jsonData.level}`);
    }

    const html = document.getElementById('sfia-output');
    html.innerHTML = ''; // Clear HTML content

    for (const category in newArr) {
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = category;
        html.appendChild(categoryEle);

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

    // Join the URL hash parts with '+', then update the hash part of the URL
    if (updateHash) {
        window.location.hash = urlHash.join("+");
    }
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
            checkbox.addEventListener('click', () => renderOutput(sfiaJson), false);
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
    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    const selectedCheckboxes = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.getAttribute('data-code') + '-' + checkbox.getAttribute('data-level'));

    const urlHash = selectedCheckboxes.join('+');
    window.location.hash = urlHash;
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

/**
 * Window onload function that is triggered when the page finishes loading.
 * It performs the following tasks:
 *  - Calls the setStoredVersion function to set the stored version
 *  - Parses the URL hash and pre-selects checkboxes
 *  - If there are selected checkboxes, it pre-selects them
 *  - Otherwise, it initializes SFIA content
 */
window.onload = async function () {
    // Log that the window onload function has been triggered
    console.log('Window onload function triggered');

    try {
        // Call the setStoredVersion function to set the stored version
        await setStoredVersion("json_source_v8-min");  // Provide the initial stored version

        // Parse URL hash and pre-select checkboxes
        const urlHash = window.location.hash.replace('#', '');
        const selectedCheckboxes = urlHash.split('+');

        // If there are selected checkboxes, pre-select them
        if (selectedCheckboxes.length > 0) {
            selectedCheckboxes.forEach(selectedCheckbox => {
                const [code, level] = selectedCheckbox.split('-');
                const checkbox = document.querySelector(`input[type=checkbox][data-code="${code}"][data-level="${level}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });

            // Trigger the renderOutput function or any other logic needed after checkboxes are pre-selected
            renderOutput(sfiaJson);
        } else {
            // If there are no selected checkboxes, initialize SFIA content
            initializeSFIAContent(sfiaJson);
        }

    } catch (error) {
        // Log any errors that occur during the onload function
        console.error('An error occurred:', error.message);
    }
};


// Check if the URL hash changes (e.g., due to user interaction)
window.addEventListener('hashchange', async function () {
    try {
        // Call getCookie to get the storedVersion value
        let storedVersion = getCookie("selectedVersion");

        if (typeof storedVersion !== 'undefined') {
            // Fetch the selected version JSON data
            let sfiaJson = await fetchData(storedVersion + ".json");

            // Trigger the renderOutput function or any other logic needed after checkboxes are pre-selected
            renderOutput(sfiaJson);
            console.info('hashchange entry: storedVersion is defined.'); 
        } else {
            // Call the function to initialize SFIA content
            initializeSFIAContent(sfiaJson);
            console.info('hashchange entry: storedVersion is undefined.');
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
});


