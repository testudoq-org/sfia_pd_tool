// BOF: initializeContent.mjs

// Import necessary functions for rendering only
import { renderSfiaOutput, renderLorOutput } from './tableRendering.mjs';
import { sfiaJson, lorJson, setSfiaJson, setLorJson } from './constants.mjs';

/**
 * Asynchronously initializes the content by calling the functions to initialize SFIA and LOR content.
 */
export const initializeContent = async () => {
    console.log('Initializing content...');

    // Initialize SFIA content
    console.log('Initializing SFIA content...');
    await initializeSFIAContent(sfiaJson);
    
    // Initialize LOR content
    console.log('Initializing LOR content...');
    await initializeLorContent(lorJson);
};

/**
 * Asynchronously initializes the checkboxes and content by calling the functions to select SFIA checkboxes and initialize LOR checkboxes.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
export const initializeCheckboxesAndContent = async (sfiaJson) => {
    // Debugging information
    console.log('Initializing checkboxes and content...');

    // Select SFIA checkboxes and initialize
    console.log('Selecting SFIA checkboxes and initializing...');
    await selectSfiaCheckboxesAndInitialize(sfiaJson);
    
    // Select LOR checkboxes and initialize using dynamic import
    console.log('Selecting LOR checkboxes and initializing...');
    const { selectLorCheckboxesAndInitialize } = await import('./urlHandling.mjs');
    await selectLorCheckboxesAndInitialize(lorJson);
};

/**
 * Initialize SFIA content by populating a table with SFIA JSON data.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
export const initializeSFIAContent = async (sfiaJson) => {
    try {
        console.log('Initializing SFIA content...');

        // Arrays to keep track of printed root and sub keys
        const rootKeyPrinted = [];
        const subKeyPrinted = [];

        // Get the table element
        const table = document.getElementById('sfia-content');
        table.innerHTML = ''; // Clear existing content before populating with new data
        console.log('Table element cleared');

        // Loop through the SFIA JSON and populate the table with data
        for (const rootKey in sfiaJson) {
            console.log('Processing root key:', rootKey);
            for (const subKey in sfiaJson[rootKey]) {
                console.log('Processing sub key:', subKey);
                for (const skillKey in sfiaJson[rootKey][subKey]) {
                    // Create a new row for each skill
                    const row = document.createElement('tr');
                    row.className += ` ${rootKey.trim().replace(/ /g, "_").toLowerCase()}`;

                    // Add the root key to the row if it hasn't been printed before
                    const col1 = document.createElement('td');
                    if (rootKeyPrinted.indexOf(rootKey) === -1) {
                        rootKeyPrinted.push(rootKey);
                        col1.textContent = rootKey;
                    }
                    col1.className += " root_key";
                    row.appendChild(col1);

                    // Add the sub key to the row if it hasn't been printed before
                    const col2 = document.createElement('td');
                    if (subKeyPrinted.indexOf(subKey) === -1) {
                        subKeyPrinted.push(subKey);
                        col2.textContent = subKey;
                    }
                    col2.className += " sub_key";
                    row.appendChild(col2);

                    // Add the skill key and its code to the row
                    const col3 = document.createElement('td');
                    col3.className += " skill_key";
                    row.appendChild(col3);
                    
                    const skillcode = sfiaJson[rootKey][subKey][skillKey]["code"];
                    const skillSpan = document.createElement('span');
                    skillSpan.textContent = `${skillKey} - ${sfiaJson[rootKey][subKey][skillKey]["code"]}`;
                    skillSpan.title = sfiaJson[rootKey][subKey][skillKey]["description"];
                    col3.appendChild(skillSpan);

                    // Add the selection boxes to the row
                    for (let i = 1; i < 8; i++) {
                        const skillData = sfiaJson[rootKey][subKey][skillKey];
                        const selectionBox = createSfiaSelectionBox(i, skillData, skillcode, rootKey, subKey, skillKey);
                        row.appendChild(selectionBox);
                    }

                    table.appendChild(row); // add entire row to table.
                }
            }
        }

        // Add a click event listener to each checkbox
        const sfiacheckboxes = document.querySelectorAll('input[type=checkbox][id^="sfia-checkbox-"]');
        sfiacheckboxes.forEach((checkbox) => {
            checkbox.addEventListener('click', () => renderSfiaOutput(sfiaJson), false);
        });
        console.log('Click event listeners added to checkboxes');

    } catch (error) {
        console.error('Error initializing SFIA content:', error);
    }

    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        console.log('URL contains a hash, rendering output...');
        renderSfiaOutput(sfiaJson, false);
    }
};

/**
 * Fetches and displays Levels of Responsibility data from the 'sfia-lors-8.json' file.
 * This function retrieves the data, clears any existing content in the table,
 * and then appends new rows to the table for each data item.
 * adds a tool tip to each of the checkboxes based on the description attribute of the lor
 */
export const initializeLorContent = async () => {
    try {
        // Fetch LOR JSON data
        const response = await fetch('json-sfia-lors-v8.json');
        const fetchedLorJson = await response.json();
        setLorJson(fetchedLorJson);

        // Clear existing content in the LOR table body
        document.getElementById('sfia-lors-content').innerHTML = '';

        // Loop through LOR JSON data and build the checklist
        fetchedLorJson.forEach((responsibility, index) => {
            const row = document.createElement('tr');
            const responsibilityPrefix = responsibility.Responsibility.substring(0, 4).toUpperCase();
            
            row.innerHTML = `
            <td>${responsibility.Responsibility}</td> <!-- Responsibility -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-1" value="${responsibilityPrefix}-1" title="1 - Follow ~ ${responsibility['1 - Follow']}"></td> <!-- Level 1 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-2" value="${responsibilityPrefix}-2" title="2 - Assist ~ ${responsibility['2 - Assist']}"></td> <!-- Level 2 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-3" value="${responsibilityPrefix}-3" title="3 - Apply ~ ${responsibility['3 - Apply']}"></td> <!-- Level 3 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-4" value="${responsibilityPrefix}-4" title="4 - Enable ~ ${responsibility['4 - Enable']}"></td> <!-- Level 4 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-5" value="${responsibilityPrefix}-5" title="5 - Ensure,advise ~ ${responsibility['5 - Ensure,advise']}"></td> <!-- Level 5 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-6" value="${responsibilityPrefix}-6" title="6 - Initiate, influence ~ ${responsibility['6 - Initiate, influence']}"></td> <!-- Level 6 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-7" value="${responsibilityPrefix}-7" title="7 - Set strategy, inspire, mobilise ~ ${responsibility['7 - Set strategy, inspire, mobilise']}"></td> <!-- Level 7 -->
        `;
            document.getElementById('sfia-lors-content').appendChild(row);

            // Add a click event listener to each LOR checkbox
            const lorCheckboxes = document.querySelectorAll('input[type=checkbox][id^="lor-"]');
            lorCheckboxes.forEach((checkbox) => {
                checkbox.addEventListener('click', async () => {
                    console.log('Checkbox clicked:', checkbox.id);
                    // First render the output
                    renderLorOutput(fetchedLorJson);
                    // Then update the URL hash using dynamic import to avoid circular dependency
                    const { updateURLWithLorCheckboxes } = await import('./urlHandling.mjs');
                    updateURLWithLorCheckboxes();
                }, false);
            });
        });
    } catch (error) {
        console.error('Error fetching or displaying LOR data:', error);
    }
    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        renderLorOutput(fetchedLorJson);
    }
};

/**
 * Creates a selection box (checkbox) for SFIA skills
 * @param {number} level - The skill level (1-7)
 * @param {Object} skillData - The skill data object
 * @param {string} skillcode - The skill code
 * @param {string} rootKey - The root category key
 * @param {string} subKey - The sub category key
 * @param {string} skillKey - The skill name key
 * @returns {HTMLElement} The checkbox element
 */
const createSfiaSelectionBox = (level, skillData, skillcode, rootKey, subKey, skillKey) => {
    const col = document.createElement('td');
    col.className = `level_${level}`;
    
    // Check if this level exists for the skill
    if (skillData && skillData.levels && skillData.levels[level]) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `sfia-checkbox-${skillcode}-${level}`;
        checkbox.value = `${skillcode}-${level}`;
        checkbox.title = skillData.levels[level];
        
        // Add sfia-data attribute for testing - match expected structure for tests
        const skillDescription = skillData.description || skillKey;
        const sfiaDataObj = {
            category: rootKey,
            subCategory: subKey,
            skill: skillDescription,
            level: level,
            code: skillcode
        };
        checkbox.setAttribute('sfia-data', JSON.stringify(sfiaDataObj));
        
        // Add event listener for URL hash updates
        checkbox.addEventListener('change', async () => {
            try {
                const { updateCombinedUrlHash } = await import('./urlHandling.mjs');
                updateCombinedUrlHash();
            } catch (error) {
                console.error('Error updating URL hash:', error);
            }
        });
        
        col.appendChild(checkbox);
    } else {
        // If level doesn't exist, create empty cell
        col.innerHTML = '';
    }
    
    return col;
};

/**
 * Selects SFIA checkboxes based on URL hash and initializes content
 * @param {Object} sfiaJson - The SFIA JSON data
 */
const selectSfiaCheckboxesAndInitialize = async (sfiaJson) => {
    try {
        // Parse the URL hash to get selected SFIA skills
        const hash = window.location.hash.substring(1);
        const parts = hash.split("&&");
        const sfiaHash = parts[0] || "";
        
        if (sfiaHash) {
            // Parse SFIA hash and select checkboxes
            const skillSelections = sfiaHash.split("+");
            skillSelections.forEach(selection => {
                if (selection.includes("-")) {
                    const [skillCode, level] = selection.split("-");
                    const checkbox = document.querySelector(`#sfia-checkbox-${skillCode}-${level}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            });
            
            // Render the output with selected checkboxes
            renderSfiaOutput(sfiaJson, false);
        }
    } catch (error) {
        console.error('Error in selectSfiaCheckboxesAndInitialize:', error);
    }
};

// EOF: initializeContent.mjs