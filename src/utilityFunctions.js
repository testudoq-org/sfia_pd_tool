// src/utilityFunctions.js

// This file includes utility functions, such as checking if the last export was within a specified timeout duration and searching for text in the SFIA table.

/**
 * Checks if the last export was within the specified timeout duration.
 *
 * @param {number} timeoutDuration - The timeout duration in milliseconds.
 * @return {boolean} True if the last export was within the timeout duration, false otherwise.
 */
function isExportSkippedDueToTimeout(timeoutDuration) {
    const currentTime = new Date().getTime();
    const timeSinceLastExport = currentTime - lastExportTime;
    return timeSinceLastExport < timeoutDuration;
}

/**
 * Function to search for text in the SFIA table and show/hide rows based on the filter.
 */
function searchForText() {
    try {
        // Get user input and filter value
        const input = document.getElementById('myInput'); // Get the input element
        if (!input) { // Check if the input element was found
            console.error("Input element not found.");
            return;
        }
        const filterValue = input.value.toUpperCase(); // Convert the input value to uppercase

        // Get table body and rows
        const tableBody = document.getElementById("sfia-content"); // Get the table body element
        if (!tableBody) { // Check if the table body element was found
            console.error("Table body element not found.");
            return;
        }
        const tableRows = tableBody.getElementsByTagName('tr'); // Get all the table rows
        if (!tableRows || tableRows.length === 0) { // Check if table rows were found
            console.error("No table rows found.");
            return;
        }

        // Loop through rows and show/hide based on filter
        for (let i = 0; i < tableRows.length; i++) {
            const skillKey = tableRows[i].getElementsByClassName("skill_key")[0]; // Get the skill key element
            if (!skillKey) { // Check if the skill key element was found
                console.error(`Skill key element not found for row ${i}.`);
                continue; // Skip this row
            }
            const skillText = skillKey.textContent; // Get the text content of the skill key
            if (skillText.toUpperCase().includes(filterValue)) { // Check if the filter value is included in the skill text
                tableRows[i].style.display = ""; // Show the row
            } else {
                tableRows[i].style.display = "none"; // Hide the row
            }
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}
