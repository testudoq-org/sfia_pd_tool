// src/checkboxHandling.js

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
        // Get the SFIA part of the hash (before &&)
        const hash = window.location.hash.substring(1);
        const sfiaPart = hash.split('&&')[0];
        
        // If no SFIA part exists, return false
        if (!sfiaPart) return false;

        // Get the levels from the SFIA hash part
        const hashLevels = sfiaPart.split("+");
        
        // Iterate through the levels in reverse order
        for (let i = hashLevels.length - 1; i >= 0; i--) {
            // Get the code and level from the current level
            const hashLevel = hashLevels[i].split("-");
            if (hashLevel.length !== 2) continue; // Skip malformed entries
            
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
    // Parse URL hash and get SFIA part
    const hash = window.location.hash.replace('#', '');
    const sfiaPart = hash.split('&&')[0];

    // If no SFIA selections, initialize empty content
    if (!sfiaPart) {
        initializeSFIAContent(sfiaJson);
        return;
    }

    const selectedCheckboxes = sfiaPart.split('+').filter(Boolean);

    // If there are selected checkboxes, pre-select them
    if (selectedCheckboxes.length > 0) {
        // Iterate over each selected checkbox
        selectedCheckboxes.forEach(selectedCheckbox => {
            // Split the selected checkbox into code and level
            const parts = selectedCheckbox.split('-');
            if (parts.length !== 2) return; // Skip malformed entries
            
            const [code, level] = parts;

            // Find the corresponding checkbox and pre-select it
            const checkbox = document.querySelector(`input[type=checkbox][id="sfia-checkbox-${code}-${level}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Trigger the renderSfiaOutput function
        renderSfiaOutput(sfiaJson, true);
    } else {
        // If no valid checkboxes found, initialize empty content
        initializeSFIAContent(sfiaJson);
    }
}
