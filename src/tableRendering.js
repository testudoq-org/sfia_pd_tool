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
