// BOF: src/dataFetching.js

let isSfiaDataLoaded = false; // State variable to track if SFIA data is loaded
let sfiaDataLoadedPromise = new Promise((resolve) => {
    window.resolveSfiaDataLoaded = resolve;
});

// This file includes functions for asynchronously fetching data from a given URL.

/**
 * Asynchronously fetches data from a given URL.
 * 
 * @param {string} url - The URL to fetch data from.
 * @return {Promise} A Promise that resolves to the parsed JSON response.
 * @throws {Error} If the HTTP response is not ok.
 */
async function fetchData(url) {
    try {
        // Fetch the data from the given URL
        const response = await fetch(url);

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            // Throw an error with the HTTP status code
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response body as JSON and return it
        return await response.json();
    } catch (error) {
        // Log any errors that occur during the fetch or parsing process
        console.error('Error fetching data:', error);
    }
}

/**
 * Retrieves the value of a cookie by its name.
 * @param {string} name - The name of the cookie.
 * @returns {string|undefined} The value of the cookie, or undefined if not found.
 */
function getCookie(name) {
    // Prepend a semicolon and the document's cookie value.
    const value = `; ${document.cookie}`;

    // Split the value based on the cookie name and a semicolon.
    const parts = value.split(`; ${name}=`);

    // If the array has a length of 2, return the value after the cookie name.
    // Otherwise, return undefined.
    if (parts.length === 2) {
        // Extract the value of the cookie by removing the trailing semicolon and any following characters.
        return parts.pop().split(';').shift();
    }
}

// Function to set the selected version in the cookie
function setStoredVersionToCookie(version) {
    document.cookie = `selectedVersion=${version}`;
}

/**
 * Sets the stored version based on the provided value.
 * @param {string} storedVersion - The version to be stored.
 */
function setStoredVersion(storedVersion) {
    const storedVersionFromCookie = getStoredVersionFromCookie();
    const dropdownValue = setDropdownValue(storedVersionFromCookie);
    const jsonData = fetchSelectedVersionData(dropdownValue);
    setupEventListenersForData(jsonData);
}

/**
 * Retrieves the stored version from the cookie, if any.
 * @returns {string} The stored version from the cookie or null if not found.
 */
function getStoredVersionFromCookie() {
    let storedVersionFromCookie = getCookie("selectedVersion");
    return storedVersionFromCookie || null;
}

/**
 * Sets the selected version in the dropdown element.
 * @param {string} storedVersion - The version to be set in the dropdown.
 * @returns {string} The selected version.
 */
function setDropdownValue(storedVersion) {
    let dropdown = document.getElementById("jsonVersionSelect");

    // Check if dropdown value is empty, null, or undefined
    if (!dropdown.value || dropdown.value === null || dropdown.value === undefined) {
        dropdown.value = storedVersion;
    }

    return dropdown.value;
}

/**
 * Fetches the selected version JSON data based on the dropdown value.
 * @param {string} dropdownValue - The value selected in the dropdown.
 * @returns {Object} The JSON data for the selected version.
 */
async function fetchSelectedVersionData(dropdownValue) {
    // Set default value if dropdownValue is empty or null
    dropdownValue = dropdownValue || "json_source_v8";
    const jsonUrl = dropdownValue + ".json";

    // Set a timeout for data loading (10 seconds)
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Data loading timeout')), 10000)
    );

    try {
        console.log(`Fetching selected version data from URL: ${jsonUrl}`);
        // Race between data fetching and timeout
        const jsonData = await Promise.race([
            fetchData(jsonUrl),
            timeout
        ]);

        if (!jsonData || !Object.keys(jsonData).length) {
            throw new Error('Invalid or empty SFIA data received');
        }
        
        // Set the state variable to true once data is loaded
        isSfiaDataLoaded = true;
        console.log('SFIA data loaded:', isSfiaDataLoaded);
        
        // Resolve the promise with the loaded data
        window.resolveSfiaDataLoaded(jsonData);
        
        // Update global state
        sfiaJson = jsonData;
        
        return jsonData;
    } catch (error) {
        console.error('Error in fetchSelectedVersionData:', error);
        isSfiaDataLoaded = false;
        sfiaJson = null;
        throw error;
    }
}

/**
 * Sets up event listeners based on the provided JSON data.
 * @param {Object} jsonData - The JSON data for the selected version.
 * @throws {Error} If jsonData is invalid or undefined
 */
function setupEventListenersForData(jsonData) {
    if (!jsonData || !Object.keys(jsonData).length) {
        isSfiaDataLoaded = false;
        throw new Error('Cannot setup listeners: Invalid or empty SFIA data');
    }
    
    console.log('Setting up event listeners with SFIA data:', jsonData);
    // We don't need to assign to sfiaJson here as it's handled in fetchSelectedVersionData
    setupEventListeners(jsonData);
}

// EOF: src/dataFetching.js
