// src/lorDataHandling.js

// This file contains functions for extracting checked Levels of Responsibility (LoR) data from the page and rendering LoR data with improved styling.

/**
 * Fetches and displays Levels of Responsibility data from the 'sfia-lors-8.json' file.
 * This function retrieves the data, clears any existing content in the table,
 * and then appends new rows to the table for each data item.
 * adds a tool tip to each of the checkboxes based onthe description attribute of the lor
 */
async function initializeLorContent() {
    try {
        // Fetch LOR JSON data
        const response = await fetch('json-sfia-lors-v8.json');
        lorJson = await response.json();

        // Clear existing content in the LOR table body
        document.getElementById('sfia-lors-content').innerHTML = '';

        // Loop through LOR JSON data and build the checklist
        lorJson.forEach((responsibility, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${responsibility.Responsibility}</td> <!-- Responsibility -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-1" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-1" title="1 - Follow ~ ${responsibility['1 - Follow']}"></td> <!-- Level 1 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-2" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-2" title="2 - Assist ~ ${responsibility['2 - Assist']}"></td> <!-- Level 2 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-3" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-3" title="3 - Apply ~ ${responsibility['3 - Apply']}"></td> <!-- Level 3 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-4" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-4" title="4 - Enable ~ ${responsibility['4 - Enable']}"></td> <!-- Level 4 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-5" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-5" title="5 - Ensure,advise ~ ${responsibility['5 - Ensure,advise']}"></td> <!-- Level 5 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-6" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-6" title="6 - Initiate, influence ~ ${responsibility['6 - Initiate, influence']}"></td> <!-- Level 6 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-7" value="${responsibility.Responsibility.substring(0, 4).toUpperCase()}-7" title="7 - Set strategy, inspire, mobilise ~ ${responsibility['7 - Set strategy, inspire, mobilise']}"></td> <!-- Level 7 -->
        `;
            document.getElementById('sfia-lors-content').appendChild(row);

            // Add a click event listener to each LOR checkbox
            const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');
            lorCheckboxes.forEach(function (checkbox) {
                checkbox.addEventListener('click', function () {
                    console.log('Checkbox clicked:', checkbox.id);
                    renderLorOutput(lorJson, false);
                }, false);
            });
        });
    } catch (error) {
        console.error('Error fetching or displaying LOR data:', error);
    }
    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        renderLorOutput(lorJson, false);
    }

}

/**
 * Render LoR data to lor-output element with improved styling.
 * 
 * @param {Array} newLorJson - Array of objects containing LoR data. Each object should have properties: lorCategory, lorLevel, and lorDescription.
 */
function renderLorData(newLorJson) {
    console.log("Entering renderLorData function");
    
    // Get the target element where the LoR data will be rendered
    const lorOutput = document.getElementById('lor-output');
    lorOutput.classList.add('lor-output-container'); // Add a CSS class for styling the container element

    // Loop through the newLorJson array and process each LoR data object
    for (const { lorCategory, lorLevel, lorDescription } of newLorJson) {
        console.log(`Rendering data for ${lorCategory} at level ${lorLevel}`);

        // Create a new element for the LoR category
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = lorCategory;
        categoryEle.classList.add('lor-category'); // Add a CSS class for styling the category element
        console.log(`Created category element for ${lorCategory}`);
        lorOutput.appendChild(categoryEle);

        // Create a new element to contain the LoR data
        const lorEle = document.createElement('div');
        lorEle.innerHTML = `
              <h2 class="lor-title">${lorCategory}</h2>
              <p class="lor-level">Level: ${lorLevel}</p>
              <p class="lor-description">Description: ${lorDescription}</p>
          `;
        lorEle.classList.add('lor-item'); // Add a CSS class for styling each LoR item
        console.log(`Created LoR element for ${lorCategory}`);
        lorOutput.appendChild(lorEle);
    }
    
    console.log("Exiting renderLorData function");
}

/**
 * Extract checked Levels of Responsibility (LoR) data from the page.
 * 
 * @returns {Array} - Array containing checked LoR data objects.
 * @throws {Error} - If any LoR checkbox is missing a required property.
 */
function extractCheckedLorData() {
    console.log("Entering extractCheckedLorData function");

    // Initialize an empty array to store the checked LoR data
    const newLorJson = [];

    console.log("Initialized newLorJson array");

    // Select all checked LoR checkboxes on the page
    const lorCheckedBoxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]:checked');

    console.log(`Found ${lorCheckedBoxes.length} checked LoR checkboxes`);

    // Loop through each checked LoR checkbox
    for (const box of lorCheckedBoxes) {
        // Extract the LoR information from the checkbox ID and value
        const [, , , lorCategory, lorLevel] = box.id.split('-');
        const lorValue = box.value;
        const lorDescription = box.title;

        // Check if any of the required properties is missing
        if (!lorCategory || !lorLevel || !lorValue || !lorDescription) {
            throw new Error(`Missing required property for LoR checkbox ${box.id}`);
        }

        console.log(`Extracted data from checkbox ${box.id}: ${lorCategory}-${lorLevel}: ${lorValue}. Title: ${lorDescription}`);

        // Add the LoR data to the newLorJson array
        newLorJson.push({
            lorCategory,
            lorLevel,
            lorValue,
            lorDescription
        });
    }

    console.log(`Returning ${newLorJson.length} checked LoR data items`);

    // Return the array containing checked LoR data
    return newLorJson;
}

/**
 * Clear the content of the lor-output element.
 */
function clearLorOutput() {
    const lorOutput = document.getElementById('lor-output');
    lorOutput.innerHTML = '';
}
