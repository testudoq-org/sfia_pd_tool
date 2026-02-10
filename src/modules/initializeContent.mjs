// BOF: initializeContent.mjs

// Import necessary functions for rendering only
import { renderSfiaOutput, renderLorOutput } from './tableRendering.mjs';
import { sfiaJson, lorJson, setSfiaJson, setLorJson } from './constants.mjs';
import { setSfiaDataLoaded } from './dataHandling.mjs';
import { VirtualScroller, computeRowData } from './virtualScroller.mjs';

/** @type {VirtualScroller|null} Singleton virtual scroller instance */
let _sfiaScroller = null;

/**
 * Return the active VirtualScroller instance (for external modules).
 * @returns {VirtualScroller|null}
 */
export const getSfiaScroller = () => _sfiaScroller;

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
 * Initialize SFIA content using virtual scrolling for performance.
 * @param {Object} sfiaJson - The SFIA JSON data.
 */
export const initializeSFIAContent = async (sfiaJson) => {
    try {
        console.log('[DEBUG SFIA] Initializing SFIA content (virtual scroller)...');
        console.log('[DEBUG SFIA] sfiaJson available:', !!sfiaJson);

        // Find (or create) the scroll container that wraps the SFIA table
        const tableWrapper = document.querySelector('.sfia-table')?.closest('.table-responsive')
            || document.getElementById('sfia-content')?.parentElement;

        if (!tableWrapper) {
            console.error('[SFIA] Could not find table wrapper element');
            setSfiaDataLoaded(false);
            return;
        }

        // Destroy previous scroller if re-initialising (e.g. version switch)
        if (_sfiaScroller) {
            _sfiaScroller.destroy();
            _sfiaScroller = null;
        }

        // Pre-compute flat row data from the nested JSON
        const rowData = computeRowData(sfiaJson);
        console.log('[DEBUG SFIA] Computed row data:', rowData.length, 'skills');

        // Create the virtual scroller
        _sfiaScroller = new VirtualScroller(tableWrapper, {
            rowHeight: 42,
            buffer: 15,
        });

        // Wire checkbox changes to rendering + URL hash + selection count
        _sfiaScroller.onCheckboxChange = async (_row, _lvl, _checked) => {
            renderSfiaOutput(sfiaJson);
            if (typeof window._updateSelectionCount === 'function') {
                window._updateSelectionCount();
            }
        };

        _sfiaScroller.setRows(rowData);

        // Signal that SFIA data loading is complete
        setSfiaDataLoaded(true);
        console.log('[DEBUG SFIA] Virtual scroller initialised with', rowData.length, 'rows');

    } catch (error) {
        console.error('Error initializing SFIA content:', error);
        setSfiaDataLoaded(false);
    }

    // Process hash and select checkboxes if URL contains a hash
        if (window.location.href.split("#").length > 1) {
            console.log('URL contains a hash, processing...');
            // Wait for SFIA data to be fully loaded before processing hash
            try {
                const { sfiaDataLoadedPromise } = await import('./dataFetching.mjs');
                console.log('[DEBUG HASH] Waiting for SFIA data to be loaded...');
                const loadedSfiaData = await sfiaDataLoadedPromise;
                console.log('[DEBUG HASH] SFIA data loaded, now processing hash...');
                await selectSfiaCheckboxesAndInitialize(loadedSfiaData || sfiaJson);
            } catch (error) {
                console.error('[DEBUG HASH] Error waiting for SFIA data:', error);
                // Fallback to processing with existing data
                await selectSfiaCheckboxesAndInitialize(sfiaJson);
            }
        }
};

/**
 * Fetches and displays Levels of Responsibility data from the 'sfia-lors-8.json' file.
 * This function retrieves the data, clears any existing content in the table,
 * and then appends new rows to the table for each data item.
 * adds a tool tip to each of the checkboxes based on the description attribute of the lor
 */
export const initializeLorContent = async () => {
    let fetchedLorJson;
    try {
        // Always use relative path for LOR JSON file
        const lorFileName = 'json-sfia-lors-v8.json';
        const lorJsonUrl = lorFileName;

        console.log('[DEBUG LOR] Constructed LOR JSON URL:', lorJsonUrl);

        // Fetch LOR JSON data using the constructed URL
        const response = await fetch(lorJsonUrl);
        
        // DEBUG: Log response details
        console.log('[DEBUG LOR] Response status:', response.status);
        console.log('[DEBUG LOR] Response ok:', response.ok);
        console.log('[DEBUG LOR] Response url:', response.url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, URL: ${response.url}`);
        }
        
        fetchedLorJson = await response.json();
        console.log('[DEBUG LOR] LOR JSON fetched successfully:', fetchedLorJson ? 'YES' : 'NO');
        console.log('[DEBUG LOR] LOR JSON length:', fetchedLorJson ? fetchedLorJson.length : 'undefined');
        
        setLorJson(fetchedLorJson);
        console.log('[DEBUG LOR] LOR JSON set in constants');

        // Clear existing content in the LOR table body
        document.getElementById('sfia-lors-content').innerHTML = '';

        // Loop through LOR JSON data and build the checklist
        fetchedLorJson.forEach((responsibility, index) => {
            const row = document.createElement('tr');
            const responsibilityPrefix = responsibility.Responsibility.substring(0, 4).toUpperCase();
            
            row.innerHTML = `
            <td>${responsibility.Responsibility}</td> <!-- Responsibility -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-1" value="${responsibilityPrefix}-1" title="1 - Follow ~ ${responsibility['1 - Follow']}" aria-label="${responsibility.Responsibility} Level 1"></td> <!-- Level 1 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-2" value="${responsibilityPrefix}-2" title="2 - Assist ~ ${responsibility['2 - Assist']}" aria-label="${responsibility.Responsibility} Level 2"></td> <!-- Level 2 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-3" value="${responsibilityPrefix}-3" title="3 - Apply ~ ${responsibility['3 - Apply']}" aria-label="${responsibility.Responsibility} Level 3"></td> <!-- Level 3 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-4" value="${responsibilityPrefix}-4" title="4 - Enable ~ ${responsibility['4 - Enable']}" aria-label="${responsibility.Responsibility} Level 4"></td> <!-- Level 4 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-5" value="${responsibilityPrefix}-5" title="5 - Ensure,advise ~ ${responsibility['5 - Ensure,advise']}" aria-label="${responsibility.Responsibility} Level 5"></td> <!-- Level 5 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-6" value="${responsibilityPrefix}-6" title="6 - Initiate, influence ~ ${responsibility['6 - Initiate, influence']}" aria-label="${responsibility.Responsibility} Level 6"></td> <!-- Level 6 -->
            <td><input type="checkbox" id="lor-checkbox-${index}-${responsibility.Responsibility}-7" value="${responsibilityPrefix}-7" title="7 - Set strategy, inspire, mobilise ~ ${responsibility['7 - Set strategy, inspire, mobilise']}" aria-label="${responsibility.Responsibility} Level 7"></td> <!-- Level 7 -->
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
                    // Update selection count badge
                    if (typeof window._updateSelectionCount === 'function') {
                        window._updateSelectionCount();
                    }
                }, false);
            });
        });
    } catch (error) {
        console.error('[DEBUG LOR] Error fetching or displaying LOR data:', error);
        console.log('[DEBUG LOR] fetchedLorJson defined:', typeof fetchedLorJson !== 'undefined');
    }
    // Render the output if the URL contains a hash
    if (window.location.href.split("#").length > 0) {
        console.log('[DEBUG LOR] URL contains hash, attempting to render LOR output...');
        console.log('[DEBUG LOR] fetchedLorJson available for rendering:', typeof fetchedLorJson !== 'undefined');
        if (typeof fetchedLorJson !== 'undefined') {
            renderLorOutput(fetchedLorJson);
        } else {
            console.error('[DEBUG LOR] fetchedLorJson is undefined, cannot render LOR output');
        }
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
            skill: skillKey, // Use skillKey instead of skillDescription for test compatibility
            level: level,
            code: skillcode
        };
        checkbox.setAttribute('sfia-data', JSON.stringify(sfiaDataObj));
        
        console.log('[DEBUG CHECKBOX] Created checkbox:', {
            id: checkbox.id,
            skill: skillKey,
            level: level,
            code: skillcode,
            sfiaData: JSON.stringify(sfiaDataObj)
        });
        
        // Special logging for BPTS (Acceptance testing) level 2
        if (skillcode === 'BPTS' && level === 2) {
            console.log('[DEBUG TEST SPECIFIC] Found BPTS-2 checkbox!');
            console.log('[DEBUG TEST SPECIFIC] Checkbox ID:', checkbox.id);
            console.log('[DEBUG TEST SPECIFIC] sfia-data attribute:', checkbox.getAttribute('sfia-data'));
            console.log('[DEBUG TEST SPECIFIC] Test expects skill="Acceptance testing", actual skill:', skillKey);
            console.log('[DEBUG TEST SPECIFIC] Element matches test XPath:', skillKey === 'Acceptance testing' && level === 2);
        }
        
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
        console.log('[DEBUG CHECKBOX] No level data for:', { skillcode, level, skillKey });
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
        
        console.log('Processing SFIA hash:', sfiaHash);
        
        if (sfiaHash) {
            // Parse SFIA hash and select checkboxes
            const skillSelections = sfiaHash.split("+");
            
            skillSelections.forEach(selection => {
                if (selection.includes("-")) {
                    const [skillCode, level] = selection.split("-");
                    const lvl = parseInt(level, 10);

                    // Update virtual scroller data model (works for off-screen rows)
                    if (_sfiaScroller) {
                        _sfiaScroller.setChecked(skillCode, lvl, true);
                    }

                    // Also update DOM if checkbox is currently rendered
                    const checkbox = document.querySelector(`#sfia-checkbox-${skillCode}-${level}`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log('Selected SFIA checkbox:', `#sfia-checkbox-${skillCode}-${level}`);
                    }
                }
            });

            // Force re-render so visible checkboxes reflect updated state
            if (_sfiaScroller) {
                _sfiaScroller._startIdx = -1; // force redraw
                _sfiaScroller._render();
            }
            
            // Render the output with selected checkboxes
            renderSfiaOutput(sfiaJson, false);
        }
    } catch (error) {
        console.error('Error in selectSfiaCheckboxesAndInitialize:', error);
    }
};

// EOF: initializeContent.mjs