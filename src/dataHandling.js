//dataHandling.js

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
