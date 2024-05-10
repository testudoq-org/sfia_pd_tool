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
 * 
 * This function retrieves all LoR checkboxes on the page, filters them to only include
 * the checked ones, retrieves their 'id' attribute, and joins them with '+' as a separator.
 * The resulting string is then set as the URL hash.
 */
function updateURLWithLorCheckboxes() {
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
