// BOF: src/modules/jsonHandling.mjs

// This file contains a function to change the JSON version based on the selected value from a dropdown.

// Import required functions
import { setStoredVersionToCookie } from './dataFetching.mjs';
import { initializeSFIAContent } from './initializeContent.mjs';
import { setupEventListeners } from './eventListeners.mjs';

/**
 * Change the JSON version based on the selected value from the dropdown.
 * This function fetches the JSON data from the specified URL and initializes
 * the SFIA content and event listeners with the new JSON data.
 */
export const changeJsonVersion = () => {

    // Get the selected value from the dropdown
    let selectedVersion = document.getElementById("jsonVersionSelect").value;

    // Check if selectedVersion is empty, null, or undefined, set default
    if (!selectedVersion || selectedVersion === null || selectedVersion === undefined) {
        selectedVersion = "json_source_v8";
    }

    // Set the selected version in the cookie
    setStoredVersionToCookie(selectedVersion);

    // Always use relative path for JSON file (works for local, dev, prod)
    const jsonUrl = `${selectedVersion}.json`;

    console.log('Fetching JSON from URL:', jsonUrl);
    
    // Use Fetch API for making the request
    fetch(jsonUrl)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}, URL: ${jsonUrl}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            // Handle the downloaded JSON data here
            console.log('JSON data loaded successfully');

            // Trigger the promise resolution if the resolveSfiaDataLoaded function exists
            if (window.resolveSfiaDataLoaded && typeof window.resolveSfiaDataLoaded === 'function') {
                console.log('Resolving SFIA data loaded promise...');
                window.resolveSfiaDataLoaded(data);
            }

            const selectElement = document.getElementById("jsonVersionSelect");
            if (selectElement) {
                const options = Array.from(selectElement.options);
                options.forEach(option => {
                    option.setAttribute(
                        "data-selected",
                        option.value === selectedVersion
                    );
                });
            } else {
                console.error("jsonVersionSelect element not found.");
            }
            // Call the function to initialize SFIA content with the new JSON data
            initializeSFIAContent(data);
            // Call the function to set up event listeners
            setupEventListeners(data);

        })
        .catch(error => {
            // Log any errors that occurred during the request
            console.error('There was a problem with the fetch request:', error);
        });
};

// EOF: src/modules/jsonHandling.mjs