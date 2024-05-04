/**
 * Listens for hash change events and performs the following tasks:
 *  - Retrieves the storedVersion value from a cookie
 *  - If the storedVersion is defined, it fetches the selected version JSON data
 *  - Calls the SelectSfiaCheckboxesAndInitialize function or initializes SFIA content
 *
 * @event hashchange
 */
window.addEventListener('hashchange', async function () {
    try {
        // Retrieve the storedVersion value from a cookie
        let storedVersion = getCookie("selectedVersion");

// If the storedVersion is defined
if (typeof storedVersion !== 'undefined') {
    // Fetch the selected version JSON data
    let sfiaJson = await fetchData(storedVersion + ".json");

    // Check if SFIA content has already been initialized
    if (!sfiaJson) {
        // Call the SelectSfiaCheckboxesAndInitialize function
        // to pre-select checkboxes and initialize SFIA content
       await  SelectSfiaCheckboxesAndInitialize(sfiaJson);

        // Call the selectLorCheckboxesAndInitialize function
        // to pre-select LoR checkboxes and initialize LoR content
       await selectLorCheckboxesAndInitialize(lorJson);

        console.info('hashchange entry: storedVersion is defined.');
    } else {
        // SFIA content has already been initialized, no need to call SelectSfiaCheckboxesAndInitialize
        console.log('SFIA content has already been initialized.');
    }
        } else {
            // Call the function to initialize SFIA content
            await initializeSFIAContent(sfiaJson);
            // Call the function to initalize LOR content
            await initializeLorContent(lorJson);
            console.info('hashchange entry: storedVersion is undefined.');
        }
    } catch (error) {
        // Log any errors that occur during hash change handling
        console.error('An error occurred:', error.message);
    }
});

/**
 * Window onload function that is triggered when the page finishes loading.
 * It performs the following tasks:
 *  - Calls the setStoredVersion function to set the stored version
 *  - Parses the URL hash and pre-selects checkboxes
 *  - If there are selected checkboxes, it pre-selects them
 *  - Otherwise, it initializes SFIA content
 */
window.onload = async function () {
    // Log that the window onload function has been triggered
    console.log('Window onload function triggered');

    try {
        // Get the current URL
        let currentURL = window.location.href;
        console.info('Current URL is:', currentURL);

        // Call the setStoredVersion function to set the stored version
        await setStoredVersion("json_source_v8");  // Provide the initial stored version


        // Check if '/#/' is already present in the URL
        if (currentURL.includes('#')) {
            // The hash exists Trigger the renderSfiaOutput function or any other logic needed after checkboxes are pre-selected
            // Parse URL hash and pre-select checkboxes
            const urlHash = window.location.hash.replace('#', '');
            const selectedCheckboxes = urlHash.split('+');

            // If there are selected checkboxes, pre-select them

            // Trigger the renderSfiaOutput function or any other logic needed after checkboxes are pre-selected
            renderSfiaOutput(sfiaJson, false);
            renderLorOutput(lorJson, false);

        } else {
            // Do another thing if the hash doesn't exist
            console.log('Hash does not exist, appending # to URL:', currentURL);
            // If there are no selected checkboxes, initialize SFIA content
            await initializeSFIAContent(sfiaJson);
            // Display Levels of Responsibility data
            await initializeLorContent();
            console.log('Hash exists in URL:', currentURL);
        }

    } catch (error) {
        // Log any errors that occur during the onload function
        console.error('An error occurred:', error.message);
    }
};
