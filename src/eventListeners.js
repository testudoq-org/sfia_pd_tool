
/**
 * Function to set up event listeners for exporting data and triggering rendering of the SFIA content.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
function setupEventListeners(sfiaJson) {
    try {
        // Log buttons to the console for debugging
        const exportCSVButton = document.getElementById("exportCSV"); // Button for exporting data to CSV
        const exportHTMLButton = document.getElementById("exportHTML"); // Button for exporting data to HTML

        // Check if buttons exist before adding event listeners
        if (exportCSVButton) {
            console.info("Export CSV button found.");
            exportCSVButton.addEventListener("click", function (event) {
                event.preventDefault();
                if (new Date().getTime() - lastExportTime < 3000) {
                    console.log("Export CSV skipped due to timeout.");
                    return;
                }
                lastExportTime = new Date().getTime();
                exportCSV(event, sfiaJson);
            });
        } else {
            console.error("Export CSV Button not found.");
        }

        if (exportHTMLButton) {
            console.info("Export HTML button found.");

            // Add event listener for exporting data to HTML
            exportHTMLButton.addEventListener("click", function (event) {
                event.preventDefault();
                if (new Date().getTime() - lastExportTime < 3000) {
                    console.log("Export HTML skipped due to timeout.");
                    return;
                }
                lastExportTime = new Date().getTime();

                // Perform UI updates or other necessary actions
                // Do not call exportHTML directly from here
            });
        } else {
            console.error("Export HTML Button not found.");
        }
    } catch (error) {
        console.error(
            "Error setting up event listeners:",
            error
        );
    }
}
