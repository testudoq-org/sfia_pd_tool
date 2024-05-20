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
