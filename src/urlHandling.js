// src/urlHandling.js

// This file includes functions for generating and updating URL hashes based on LoR data and SFIA checkboxes.

/**
 * LoR category to abbreviated code mapping
 */
const LOR_ABBREVIATIONS = {
    'Autonomy': 'AUTO',
    'Influence': 'INFL',
    'Complexity': 'COMP',
    'Business': 'BUSI',
    'Knowledge': 'KNOW'
};

/**
 * Convert full LoR category name to standardized abbreviation
 * @param {string} category - Full LoR category name
 * @returns {string} Standardized 4-letter abbreviation
 */
function getStandardizedLorCode(category) {
    // First check if it's already a standard code
    if (Object.values(LOR_ABBREVIATIONS).includes(category)) {
        return category;
    }
    // Then check if we have a mapping for it
    const abbreviated = LOR_ABBREVIATIONS[category];
    if (abbreviated) {
        return abbreviated;
    }
    // If no mapping exists, create a standardized 4-letter code
    return category.substring(0, 4).toUpperCase();
}

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
 * the checked ones, retrieves their value attribute, and joins them with '+' as a separator.
 *
 * @param {string} hash - The combined LoR hash string (optional).
 */
function updateURLWithLorCheckboxes(hash) {
    // If hash is provided, update g_lorhash directly
    if (hash) {
        g_lorhash = hash;
        updateCombinedUrlHash();
        return;
    }

    // Otherwise, gather checked checkboxes
    const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');
    const selectedLorCheckboxes = Array.from(lorCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => {
            // Extract the value and standardize it
            const [category, level] = checkbox.value.split('-');
            return `${getStandardizedLorCode(category)}-${level}`;
        });

    g_lorhash = selectedLorCheckboxes.join('+');
    updateCombinedUrlHash();
}

/**
 * Select checkboxes based on the URL hash and trigger the renderLorOutput function.
 * Uses the new parseLorValuesFromHash function to correctly parse LoR values.
 *
 * @param {Object} lorJson - The LoR JSON data.
 */
function selectLorCheckboxesAndInitialize(lorJson) {
    // Parse LoR values from the hash
    const lorValues = parseLorValuesFromHash();
    
    // If no LoR values found, initialize empty content
    if (lorValues.length === 0) {
        initializeLorContent(lorJson);
        return;
    }

    // Select checkboxes based on parsed values
    lorValues.forEach(({ lorCategory, lorLevel }) => {
        const checkbox = document.querySelector(`input[type=checkbox][value="${lorCategory}-${lorLevel}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Trigger render with the selected values
    renderLorOutput(lorJson, true);
}

// src/urlHandling.js

/**
 * Generate URL hash based on combined LoR and SFIA data.
 * 
 * @param {Object} lorJson - The LoR JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @returns {string} - Combined URL hash string.
 */
/**
 * Parse LoR values from the URL hash.
 * @returns {Array} Array of parsed LoR values.
 */
function parseLorValuesFromHash() {
    const hash = window.location.hash.substring(1);
    const parts = hash.split("&&");
    // LoR hash is second part if it exists, otherwise check if the only part contains a LoR code
    const lorPart = parts[1] || (Object.values(LOR_ABBREVIATIONS).some(code => parts[0].includes(code)) ? parts[0] : "");
    if (!lorPart) return [];
    
    return lorPart.split("+").filter(Boolean).map(item => {
        const [category, level] = item.split("-");
        // Standardize the category code
        return {
            lorCategory: getStandardizedLorCode(category),
            lorLevel: parseInt(level)
        };
    });
}

/**
 * Generate URL hash based on combined LoR and SFIA data.
 * @param {Object} lorJson - The LoR JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 * @returns {string} - Combined URL hash string using && separator.
 */
function generateUrlHash(lorJson, sfiaJson) {
    const lorHash = generateLorHash(lorJson);
    const sfiaHash = generateSfiaHash(sfiaJson);
    return lorHash && sfiaHash ? `${sfiaHash}&&${lorHash}` : lorHash || sfiaHash;
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
        // Ensure category is in standardized format
        const standardizedCategory = getStandardizedLorCode(lorCategory);
        urlHash.push(`${standardizedCategory}-${lorLevel}`);
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
