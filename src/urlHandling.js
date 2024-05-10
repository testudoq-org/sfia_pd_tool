// src/urlHandling.js

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
                Object.values(subCategory).map(skill =>
                    `${skill["code"]}-${Object.keys(skill["levels"]).join('+')}`
                )
            )
        );
        window.location.hash = urlHash.join("+");
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
    const urlHash = selectedLorCheckboxes.join('+');
    window.location.hash = urlHash;
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
