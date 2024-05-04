
/**
 * Change the JSON version based on the selected value from the dropdown.
 * This function fetches the JSON data from the specified URL and initializes
 * the SFIA content and event listeners with the new JSON data.
 */
function changeJsonVersion() {

    // Get the selected value from the dropdown
    let selectedVersion = document.getElementById("jsonVersionSelect").value;

    // Set a cookie to remember the selected version
    document.cookie = "selectedVersion=" + selectedVersion;

    // Get the current host
    let currentHost = window.location.origin;

    // Construct the URL for the JSON file based on the selected version and current host
    //let jsonUrl = currentHost + "/src/" + selectedVersion + ".json";
    // Construct the URL for the JSON file based on the selected version and current host
    let jsonUrl;

    if (window.location.hostname === '127.0.0.1') {
        if (window.location.pathname.includes('/dist/')) {
            jsonUrl = currentHost + "/dist/" + selectedVersion + ".json";
        } else if (window.location.pathname.includes('/src/')) {
            jsonUrl = currentHost + "/src/" + selectedVersion + ".json";
        } else {
            // Default to '/src/' for localhost if neither '/dist/' nor '/src/' is found
            jsonUrl = currentHost + "/src/" + selectedVersion + ".json";
        }
    } else {
        // Production environment
        jsonUrl = currentHost + "/sfia/" + selectedVersion + ".json";
    }


    // Use Fetch API for making the request
    fetch(jsonUrl)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            // Handle the downloaded JSON data here
            console.log("Downloaded JSON data:", data);


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

}
