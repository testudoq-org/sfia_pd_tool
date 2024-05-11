// src/windowEvents.js

// This file contains functions to handle window events, such as 'hashchange' and 'onload'.

/**
 * Listens for hash change events and performs the following tasks:
 *  - Retrieves the storedVersion value from a cookie
 *  - If the storedVersion is defined, it fetches the selected version JSON data
 *  - Calls the SelectSfiaCheckboxesAndInitialize function or initializes SFIA content
 *
 * @event hashchange
 */
async function handleHashChange() {
    try {
        let storedVersion = getCookie(SELECTED_VERSION);

        if (storedVersion == null) {
            console.info('hashchange entry: storedVersion is undefined.');
            await initializeContent();
            return;
        }

        let sfiaJson = await fetchData(storedVersion + ".json");

        if (sfiaJson) {
            console.log('SFIA content has already been initialized.');
            return;
        }

        console.info('hashchange entry: storedVersion is defined.');
        await initializeCheckboxesAndContent(sfiaJson);
    } catch (error) {
        console.error('An error occurred:', error.message);
        // handle error (retry, show error message, etc.)
    }
}

window.addEventListener('hashchange', handleHashChange);


/**
 * Window onload function that is triggered when the page finishes loading.
 * It performs the following tasks:
 *  - Calls the setStoredVersion function to set the stored version
 *  - Parses the URL hash and pre-selects checkboxes
 *  - If there are selected checkboxes, it pre-selects them
 *  - Otherwise, it initializes SFIA content
 */
window.onload = async function () {
    console.log('Window onload function triggered');

    try {
        // Call the function to update the URL hash initially
        updateCombinedUrlHash();

        // Set the stored version
        await setStoredVersion("json_source_v8");

        // Initialize SFIA content
        await initializeSFIAContent(sfiaJson);
        // Initialize LOR content
        await initializeLorContent(lorJson);

        let currentURL = window.location.href;
        console.info('Current URL is:', currentURL);

        if (currentURL.includes('#')) {
            // Parse URL hash and pre-select checkboxes
            console.log('Hash exists in URL:', currentURL);
            const urlHash = window.location.hash.replace('#', '');
            const selectedCheckboxes = urlHash.split('+');

            // Pre-select checkboxes if needed
            renderSfiaOutput(sfiaJson, false);
            renderLorOutput(lorJson, false);
        } else {
            console.log('Hash does not exist, appending # to URL:', currentURL);

        }
    } catch (error) {
        console.error('An error occurred during the onload function:', error.message);
    }
};
