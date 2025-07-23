// Improvements (2025-07-23):
// - Upgraded to Bootstrap 5 for modern, responsive UI
// - Added ARIA roles and tabindex for accessibility on output area
// - Added "Copy Output" button for user convenience
// - Integrated Prism.js for JSON syntax highlighting in output
// - Refactored CSS for Bootstrap 5 alignment and accessibility
// - Output area now uses <pre><code class="language-json"></code></pre> for accessibility and highlighting
// csv2json.mjs - Extracted from csv2json.htm
// Debugging statements added and SonarQube compliance improvements

/**
 * SFIA Data Processor Module
 * Converts SFIA skill data from CSV format to structured JSON
 * 
 * @author Your Name
 * @version 2.0
 */
import { sfia2csv } from './sfia2csv.json.mjs';
if (typeof window !== "undefined") {
    window.sfia2csv = sfia2csv;
}

class SFIAProcessor {
    // Module-scoped constants
    // [CLEANUP] Removed debug logs after scoping fix
    static OUTPUT_FORMATS = {
        PRETTY: 'pretty',
        COMPACT: 'compact'
    };

    static LEVEL_DESCRIPTIONS = [
        'Level 1 description',
        'Level 2 description', 
        'Level 3 description',
        'Level 4 description',
        'Level 5 description',
        'Level 6 description',
        'Level 7 description'
    ];

    constructor() {
        this.currentFormat = SFIAProcessor.OUTPUT_FORMATS.PRETTY;
        this.processedData = null;
        this.statistics = {
            categories: 0,
            subcategories: 0,
            skills: 0,
            errors: 0
        };
        console.log('[SFIAProcessor] Initialized');
    }

    /**
     * Main processing method - converts raw SFIA data to structured JSON
     * @param {Array} rawData - Raw SFIA data array
     * @returns {Object} Structured SFIA data object
     */
    processData(rawData = window.sfia2csv) {
        // [CLEANUP] Removed debug logs after scoping fix
        try {
            this.showStatus('Processing SFIA data...', 'info');
            this.resetStatistics();

            if (!this.validateInput(rawData)) {
                throw new Error('Invalid input data provided');
            }

            const structuredData = {};
            this.buildCategories(rawData, structuredData);

            this.processedData = structuredData;
            this.displayOutput();
            this.showStatus(`Successfully processed ${this.statistics.skills} skills in ${this.statistics.categories} categories`, 'success');

            console.log('[processData] Processing complete:', structuredData);
            return structuredData;
        } catch (error) {
            this.handleError('Data processing failed', error);
            return null;
        }
    }

    /**
     * Validates input data structure and content
     * @param {Array} data - Input data to validate
     * @returns {boolean} Validation result
     */
    validateInput(data) {
        console.log('[validateInput] Validating input data');
        if (!Array.isArray(data)) {
            throw new Error('Input data must be an array');
        }

        if (data.length === 0) {
            throw new Error('Input data array is empty');
        }

        const requiredFields = ['Category', 'Subcategory', 'Skill', 'Code', 'Overall description'];
        const sampleItem = data[0];

        for (const field of requiredFields) {
            if (!(field in sampleItem)) {
                throw new Error(`Required field '${field}' not found in data structure`);
            }
        }

        return true;
    }

    /**
     * Builds category structure from raw data
     * @param {Array} rawData - Raw SFIA data
     * @param {Object} targetObject - Target object to populate
     */
    buildCategories(rawData, targetObject) {
        console.log('[buildCategories] Building categories');
        const categoryLookup = new Set();

        for (const item of rawData) {
            const { Category: category } = item;

            if (!category) {
                this.statistics.errors++;
                console.warn('[buildCategories] Item missing category:', item);
                continue;
            }

            if (!categoryLookup.has(category)) {
                categoryLookup.add(category);
                targetObject[category] = {};
                this.buildSubcategories(category, rawData, targetObject);
                this.statistics.categories++;
                console.log(`[buildCategories] Added category: ${category}`);
            }
        }
    }

    /**
     * Builds subcategory structure for a given category
     * @param {string} categoryName - Name of the parent category
     * @param {Array} rawData - Raw SFIA data
     * @param {Object} targetObject - Target object to populate
     */
    buildSubcategories(categoryName, rawData, targetObject) {
        console.log(`[buildSubcategories] Building subcategories for: ${categoryName}`);
        const subcategoryLookup = new Set();
        const categoryData = rawData.filter(item => item.Category === categoryName);

        for (const item of categoryData) {
            const { Subcategory: subcategory } = item;

            if (!subcategory) {
                this.statistics.errors++;
                console.warn('[buildSubcategories] Item missing subcategory:', item);
                continue;
            }

            if (!subcategoryLookup.has(subcategory)) {
                subcategoryLookup.add(subcategory);
                targetObject[categoryName][subcategory] = this.buildSkills(subcategory, rawData);
                this.statistics.subcategories++;
                console.log(`[buildSubcategories] Added subcategory: ${subcategory}`);
            }
        }
    }

    /**
     * Builds skills structure for a given subcategory
     * @param {string} subcategoryName - Name of the subcategory
     * @param {Array} rawData - Raw SFIA data
     * @returns {Object} Skills object for the subcategory
     */
    buildSkills(subcategoryName, rawData) {
        console.log(`[buildSkills] Building skills for: ${subcategoryName}`);
        const skills = {};
        const subcategoryData = rawData.filter(item => item.Subcategory === subcategoryName);

        for (const item of subcategoryData) {
            try {
                const skillData = this.createSkillObject(item);
                skills[item.Skill] = skillData;
                this.statistics.skills++;
            } catch (error) {
                this.statistics.errors++;
                console.error(`[buildSkills] Error processing skill ${item.Skill}:`, error);
            }
        }

        return skills;
    }

    /**
     * Creates a skill object from raw data item
     * @param {Object} item - Raw data item
     * @returns {Object} Processed skill object
     */
    createSkillObject(item) {
        const {
            Code: code,
            'Overall description': description,
            'Guidance notes': guidanceNotes,
            ...levelData
        } = item;

        const skill = {
            code: this.sanitizeText(code || ''),
            description: this.sanitizeText(description || ''),
            guidanceNotes: this.sanitizeText(guidanceNotes || ''),
            levels: this.extractLevels(levelData)
        };

        return skill;
    }

    /**
     * Extracts level descriptions from item data
     * @param {Object} itemData - Raw item data containing level descriptions
     * @returns {Object} Levels object with non-empty level descriptions
     */
    extractLevels(itemData) {
        const levels = {};

        SFIAProcessor.LEVEL_DESCRIPTIONS.forEach((levelKey, index) => {
            const levelNumber = (index + 1).toString();
            const levelDescription = itemData[levelKey];

            if (levelDescription && levelDescription.trim() !== '') {
                levels[levelNumber] = this.sanitizeText(levelDescription.trim());
            }
        });

        return levels;
    }

    /**
     * Sanitizes text by handling encoding issues and special characters
     * @param {string} text - Text to sanitize
     * @returns {string} Cleaned text
     */
    sanitizeText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let cleanedText = text;

        // Handle common encoding issues and malformed characters
        const stringReplacements = {
            '�': "'",
            '�s': "'s",
            '�t': "'t",
            '�re': "'re",
            '�ve': "'ve",
            '�ll': "'ll",
            '�m': "'m",
            '�d': "'d",
            'â€™': "'",
            'â€œ': '"',
            'â€�': '"',
            'â€"': '–',
            'â€"': '—',
            'â€¢': '•',
            'Â': '',
            'Ã¢': 'â',
            'Ã©': 'é',
            'Ã¨': 'è',
            'Ã ': 'à',
        };

        Object.entries(stringReplacements).forEach(([pattern, replacement]) => {
            cleanedText = cleanedText.split(pattern).join(replacement);
        });

        cleanedText = cleanedText
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/\uFFFD/g, '')
            .replace(/[\u0080-\u009F]/g, '');

        cleanedText = cleanedText
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/'+/g, "'")
            .replace(/\s+([,.!?;:])/g, '$1')
            .replace(/([,.!?;:])\s+/g, '$1 ');

        if (this.containsProblematicCharacters(cleanedText)) {
            console.warn('[sanitizeText] Text still contains problematic characters after sanitization:', cleanedText);
        }

        return cleanedText;
    }

    /**
     * Checks if text contains problematic characters that should be filtered
     * @param {string} text - Text to check
     * @returns {boolean} True if problematic characters are found
     */
    containsProblematicCharacters(text) {
        if (text.includes('�')) return true;
        if (/[\uFFFD]/.test(text)) return true;
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) return true;
        if (/[\u0080-\u009F]/.test(text)) return true;
        if (/\u00A0{2,}/.test(text)) return true;

        return false;
    }

    displayOutput() {
        const outputElement = document.getElementById('output');
        if (!outputElement) return;

        const codeElement = outputElement.querySelector('code');
        if (!this.processedData) {
            if (codeElement) codeElement.textContent = 'No data to display';
            outputElement.setAttribute('aria-live', 'polite');
            outputElement.setAttribute('role', 'region');
            return;
        }

        const jsonString = this.currentFormat === SFIAProcessor.OUTPUT_FORMATS.PRETTY
            ? JSON.stringify(this.processedData, null, 2)
            : JSON.stringify(this.processedData);

        if (codeElement) {
            codeElement.textContent = jsonString;
            if (window.Prism && Prism.highlightElement) {
                Prism.highlightElement(codeElement);
            }
            // Announce update for screen readers
            outputElement.setAttribute('aria-live', 'polite');
            outputElement.setAttribute('role', 'region');
        }
    }

    /**
     * Shows status messages to the user
     * @param {string} message - Status message
     * @param {string} type - Message type (success, error, info)
     */
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        const className = type === 'error' ? 'error' :
                         type === 'success' ? 'success' : 'info';

        // Use aria-live for screen readers
        statusElement.setAttribute('role', 'status');
        statusElement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        statusElement.innerHTML = `<div class="${className}" tabindex="0">${message}</div>`;

        // Focus the status for screen reader announcement
        const statusDiv = statusElement.querySelector('div');
        if (statusDiv) statusDiv.focus();

        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                statusElement.innerHTML = '';
            }, 5000);
        }
    }

    /**
     * Handles errors with proper logging and user feedback
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error('[handleError]', message, error);
        this.statistics.errors++;
        this.showStatus(`${message}: ${error.message}`, 'error');
    }

    /**
     * Resets processing statistics
     */
    resetStatistics() {
        this.statistics = {
            categories: 0,
            subcategories: 0,
            skills: 0,
            errors: 0
        };
        console.log('[resetStatistics] Statistics reset');
    }

    /**
     * Displays processing statistics
     */
    showStats() {
        const statsElement = document.getElementById('stats');
        const statsHtml = `
            <div class="stat-item">
                <div class="stat-number">${this.statistics.categories}</div>
                <div>Categories</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.statistics.subcategories}</div>
                <div>Subcategories</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.statistics.skills}</div>
                <div>Skills</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.statistics.errors}</div>
                <div>Errors</div>
            </div>
        `;

        statsElement.innerHTML = statsHtml;
        statsElement.style.display = statsElement.style.display === 'none' ? 'flex' : 'none';
        statsElement.setAttribute('role', 'status');
        statsElement.setAttribute('aria-live', 'polite');
        statsElement.setAttribute('tabindex', '0');
        statsElement.focus();
    }

    /**
     * Toggles between pretty and compact JSON formatting
     */
    toggleFormat() {
        this.currentFormat = this.currentFormat === SFIAProcessor.OUTPUT_FORMATS.PRETTY
            ? SFIAProcessor.OUTPUT_FORMATS.COMPACT
            : SFIAProcessor.OUTPUT_FORMATS.PRETTY;

        if (this.processedData) {
            this.displayOutput();
        }

        this.showStatus(`Switched to ${this.currentFormat} format`, 'info');
    }

    /**
     * Clears the output display and resets statistics
     */
    clearOutput() {
        const outputElement = document.getElementById('output');
        const codeElement = outputElement ? outputElement.querySelector('code') : null;
        if (codeElement) codeElement.textContent = 'Output cleared';
        document.getElementById('status').innerHTML = '';
        const statsElement = document.getElementById('stats');
        statsElement.style.display = 'none';

        // Reset statistics to 0
        this.resetStatistics();

        // Update the statistics display if it's currently visible
        const statsHtml = `
            <div class="stat-item">
                <div class="stat-number">0</div>
                <div>Categories</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0</div>
                <div>Subcategories</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0</div>
                <div>Skills</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0</div>
                <div>Errors</div>
            </div>
        `;
        statsElement.innerHTML = statsHtml;

        this.processedData = null;
        console.log('[clearOutput] Output and statistics cleared');
    }

    /**
     * Downloads the processed JSON data as a file
     */
    downloadJson() {
        if (!this.processedData) {
            this.showStatus('No data to download. Please process data first.', 'error');
            return;
        }

        try {
            const jsonString = JSON.stringify(this.processedData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `sfia-processed-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showStatus('JSON file downloaded successfully', 'success');
        } catch (error) {
            this.handleError('Download failed', error);
        }
    }
}

// Create global instance for easy access from HTML
window.sfiaProcessor = new SFIAProcessor();

// Auto-process data on page load
// Debug log to check if sfia2csv is available before processing
    // [CLEANUP] Removed debug logs after scoping fix
document.addEventListener('DOMContentLoaded', () => {
    window.sfiaProcessor.processData();
    console.log('[DOMContentLoaded] Auto-processed data on load');
});