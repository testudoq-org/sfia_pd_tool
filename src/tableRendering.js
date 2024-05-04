// src/tableRendering.js

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

/**
 * Initialize SFIA content by populating a table with SFIA JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
async function initializeSFIAContent(sfiaJson) {
    try {
        // Arrays to keep track of printed root and sub keys
        const rootKeyPrinted = [];
        const subKeyPrinted = [];

        // Get the table element
        const table = document.getElementById('sfia-content');
        table.innerHTML = ''; // Clear existing content before populating with new data

        // Loop through the SFIA JSON and populate the table with data
        for (const rootKey in sfiaJson) {
            for (const subKey in sfiaJson[rootKey]) {
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

                    const skillSpan = document.createElement('span');
                    skillSpan.textContent = skillKey + " - " + sfiaJson[rootKey][subKey][skillKey]["code"];
                    skillSpan.title = sfiaJson[rootKey][subKey][skillKey]["description"];
                    col3.appendChild(skillSpan);

                    // Add the selection boxes to the row
                    for (let i = 1; i < 8; i++) {
                        row.appendChild(addSfiaSelectionBox(i, sfiaJson, rootKey, subKey, skillKey));
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

    } catch (error) {
        console.error('Error initializing SFIA content:', error);
    }

    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        renderSfiaOutput(sfiaJson, false);
    }

}
