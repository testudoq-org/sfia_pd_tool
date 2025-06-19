// BOF: src/modules/tableRendering.mjs

// This file includes functions for rendering the output HTML based on the selected checkboxes and the provided SFIA JSON data.

import { updateSfiaUrlHash, generateUrlHash } from './urlHandling.mjs';
import { extractCheckedLorData, clearLorOutput, renderLorData } from './dataHandling.mjs';

/**
 * Render the output HTML based on the selected checkboxes and the provided SFIA JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @param {boolean} updateHash - Flag to indicate whether to update the URL hash.
 */
export const renderSfiaOutput = (sfiaJson, updateHash = true) => {
    const checkedBoxes = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]:checked');
    const filteredData = filterSfiaData(sfiaJson, checkedBoxes);
    renderSfiaHtmlOutput(filteredData);
    updateSfiaUrlHash(filteredData, updateHash);
};

/**
 * Filter SFIA JSON data based on the checked checkboxes.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @param {NodeList} checkedBoxes - The checked checkboxes.
 * @returns {Object} - Filtered SFIA data.
 */
export const filterSfiaData = (sfiaJson, checkedBoxes) => {
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
};

/**
 * Render HTML output based on filtered SFIA data.
 * @param {Object} filteredData - Filtered SFIA data.
 */
export const renderSfiaHtmlOutput = (filteredData) => {
    const html = document.getElementById('sfia-output');
    html.innerHTML = '';
    
    console.log('[DEBUG] renderSfiaHtmlOutput - filteredData:', filteredData);
    console.log('[DEBUG] renderSfiaHtmlOutput - sfia-output element:', html);
    
    for (const category in filteredData) {
        console.log('[DEBUG] Processing category:', category);
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = category;
        html.appendChild(categoryEle);
        renderSfiaSubCategoryAndSkills(html, filteredData[category]);
    }
    
    console.log('[DEBUG] Final sfia-output innerHTML:', html.innerHTML);
};

/**
 * Render sub-category headings and skill information.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {Object} subCategories - Sub-categories data.
 */
export const renderSfiaSubCategoryAndSkills = (html, subCategories) => {
    for (const subCategory in subCategories) {
        const subCategoryEle = document.createElement('h2');
        subCategoryEle.textContent = subCategory;
        html.appendChild(subCategoryEle);
        renderSfiaSkills(html, subCategories[subCategory]);
    }
};

/**
 * Render skills information.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {Object} skills - Skills data.
 */
export const renderSfiaSkills = (html, skills) => {
    for (const skill in skills) {
        const skillEle = document.createElement('h3');
        const skillText = `${skill} - ${skills[skill]["code"]}`;
        skillEle.textContent = skillText;
        
        console.log('[DEBUG] renderSfiaSkills - skill:', skill);
        console.log('[DEBUG] renderSfiaSkills - code:', skills[skill]["code"]);
        console.log('[DEBUG] renderSfiaSkills - generated text:', skillText);
        
        html.appendChild(skillEle);
        renderSfiaSkillDescription(html, skills[skill]["description"]);
        renderSfiaSkillLevels(html, skills[skill]["levels"]);
    }
};

/**
 * Render skill description.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {string} description - Skill description.
 */
export const renderSfiaSkillDescription = (html, description) => {
    const skillDescriptionEle = document.createElement('p');
    skillDescriptionEle.textContent = description;
    html.appendChild(skillDescriptionEle);
};

/**
 * Render skill level information.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {Object} levels - Skill levels data.
 */
export const renderSfiaSkillLevels = (html, levels) => {
    for (const level in levels) {
        const levelEle = document.createElement('h4');
        levelEle.textContent = `Level ${level}`;
        html.appendChild(levelEle);
        renderSfiaLevelDescription(html, levels[level]);
    }
};

/**
 * Render level description.
 * @param {HTMLElement} html - HTML element to render output.
 * @param {string} description - Level description.
 */
export const renderSfiaLevelDescription = (html, description) => {
    const levelDescriptionEle = document.createElement('p');
    levelDescriptionEle.textContent = description;
    html.appendChild(levelDescriptionEle);
};

/**
 * Render the output HTML based on the selected Levels of Responsibility (LoR) checkboxes.
 * This function only handles rendering and does not update URLs.
 *
 * @param {Object} lorJson - The LoR JSON data.
 */
export const renderLorOutput = (lorJson) => {
    console.log("Entering renderLorOutput function");

    // Extract checked LoR data from the page
    const newLorJson = extractCheckedLorData();
    console.log("newLorJson:", newLorJson);

    console.log("Clearing lor-output element");
    clearLorOutput();

    console.log("Rendering LoR data to lor-output element");
    renderLorData(newLorJson);

    console.log("Exiting renderLorOutput function");
};

/**
 * Generate LoR hash from current checkbox selections
 * This is a utility function for other modules to use
 *
 * @returns {string} - Generated LoR hash string
 */
export const generateLorHashFromCheckboxes = () => {
    const newLorJson = extractCheckedLorData();
    return generateUrlHash(newLorJson);
};

// EOF: src/modules/tableRendering.mjs