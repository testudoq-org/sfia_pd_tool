
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


/**
 * Sets the stored version based on the provided value.
 * @param {string} storedVersion - The version to be stored.
 */
function setStoredVersion(storedVersion) {
    // Get the stored version from the cookie, if any
    let storedVersionFromCookie = getCookie("selectedVersion");

    // If no stored version is found in the cookie, use the provided storedVersion
    if (!storedVersionFromCookie) {
        storedVersionFromCookie = storedVersion;
    }

    // Set the selected version in the dropdown
    let dropdown = document.getElementById("jsonVersionSelect");
    dropdown.value = storedVersionFromCookie;

    // Trigger the changeJsonVersion function to download the selected version
    changeJsonVersion();  // Remove await here

    // Fetch the selected version JSON data
    const sfiaJson = fetchData(storedVersionFromCookie + ".json");  // Remove await here

    // Call the function to set up event listeners
    setupEventListeners(sfiaJson);
}
