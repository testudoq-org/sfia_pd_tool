// src/tableRendering.js

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


// src/tableRendering.js

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
    const generatedHash = generateUrlHash(newLorJson); // Store generated hash in a new variable
    console.log("generatedHash:", generatedHash);

    console.log("Updating URL hash if necessary");
    if (updateHash) {
        console.log("Updating URL hash");
        updateURLWithLorCheckboxes(generatedHash); // Use the new variable
    }

    console.log("Exiting renderLorOutput function");
}
