// src/modules/urlHandling.mjs
/**
 * ES6 Module for URL handling functions
 * Modernized version of src/urlHandling.js
 */

/**
 * LoR category to abbreviated code mapping
 */
const LOR_ABBREVIATIONS = {
    'Autonomy': 'AUTO',
    'Influence': 'INFL',
    'Complexity': 'COMP',
    'Business': 'BUSI',
    'Knowledge': 'KNOW'
};

/**
 * Convert full LoR category name to standardized abbreviation
 * @param {string} category - Full LoR category name
 * @returns {string} Standardized 4-letter abbreviation
 */
export function getStandardizedLorCode(category) {
    // Input validation
    if (typeof category !== 'string') {
        console.warn('getStandardizedLorCode: Invalid input type, expected string');
        return '';
    }
    
    // First check if it's already a standard code
    if (Object.values(LOR_ABBREVIATIONS).includes(category)) {
        return category;
    }
    
    // Then check if we have a mapping for it
    const abbreviated = LOR_ABBREVIATIONS[category];
    if (abbreviated) {
        return abbreviated;
    }
    
    // If no mapping exists, create a standardized 4-letter code
    return category.substring(0, 4).toUpperCase();
}

/**
 * Parse SFIA codes from URL hash
 * @param {string} hash - URL hash string (optional, defaults to current location)
 * @returns {Array} Array of parsed SFIA skill objects
 */
export function parseSfiaCodesFromHash(hash = window.location.hash) {
    try {
        if (!hash) return [];
        
        // Remove # symbol and get SFIA part (before &&)
        const cleanHash = hash.substring(1);
        const sfiaPart = cleanHash.split('&&')[0];
        
        if (!sfiaPart) return [];
        
        const hashLevels = sfiaPart.split("+").filter(level => level.trim());
        const parsedSkills = [];
        
        for (const level of hashLevels) {
            const parts = level.split("-");
            if (parts.length === 2) {
                const code = parts[0].trim();
                const skillLevel = parseInt(parts[1]);
                
                if (code && !isNaN(skillLevel)) {
                    parsedSkills.push({ code, level: skillLevel });
                }
            }
        }
        
        return parsedSkills;
    } catch (error) {
        console.error('Error parsing SFIA codes from hash:', error);
        return [];
    }
}

/**
 * Parse LoR values from URL hash
 * @param {string} hash - URL hash string (optional, defaults to current location)
 * @returns {Array} Array of parsed LoR objects
 */
export function parseLorValuesFromHash(hash = window.location.hash) {
    try {
        if (!hash) return [];
        
        // Remove # symbol and get LoR part (after &&)
        const cleanHash = hash.substring(1);
        const hashParts = cleanHash.split('&&');
        
        if (hashParts.length < 2) return [];
        
        const lorPart = hashParts[1];
        if (!lorPart) return [];
        
        const lorLevels = lorPart.split("+").filter(level => level.trim());
        const parsedLor = [];
        
        for (const level of lorLevels) {
            const parts = level.split("-");
            if (parts.length === 2) {
                const lorCategory = parts[0].trim();
                const lorLevel = parseInt(parts[1]);
                
                if (lorCategory && !isNaN(lorLevel)) {
                    parsedLor.push({ lorCategory, lorLevel });
                }
            }
        }
        
        return parsedLor;
    } catch (error) {
        console.error('Error parsing LoR values from hash:', error);
        return [];
    }
}

/**
 * Generate SFIA hash string from skill selections
 * @param {Array} skills - Array of skill objects with code and level
 * @returns {string} Generated hash string
 */
export function generateSfiaHash(skills) {
    try {
        if (!Array.isArray(skills) || skills.length === 0) {
            return '';
        }
        
        const validSkills = skills.filter(skill => 
            skill && 
            typeof skill.code === 'string' && 
            skill.code.trim() &&
            typeof skill.level === 'number' && 
            skill.level > 0
        );
        
        return validSkills.map(skill => `${skill.code}-${skill.level}`).join('+');
    } catch (error) {
        console.error('Error generating SFIA hash:', error);
        return '';
    }
}

/**
 * Generate LoR hash string from LoR selections
 * @param {Array} lorValues - Array of LoR objects with category and level
 * @returns {string} Generated LoR hash string
 */
export function generateLorHash(lorValues) {
    try {
        if (!Array.isArray(lorValues) || lorValues.length === 0) {
            return '';
        }
        
        const validLorValues = lorValues.filter(lor => 
            lor && 
            typeof lor.lorCategory === 'string' && 
            lor.lorCategory.trim() &&
            typeof lor.lorLevel === 'number' && 
            lor.lorLevel > 0
        );
        
        return validLorValues.map(lor => {
            const standardizedCode = getStandardizedLorCode(lor.lorCategory);
            return `${standardizedCode}-${lor.lorLevel}`;
        }).join('+');
    } catch (error) {
        console.error('Error generating LoR hash:', error);
        return '';
    }
}

/**
 * Update the URL with combined SFIA and LoR hashes
 * @param {string} sfiaHash - SFIA hash string
 * @param {string} lorHash - LoR hash string
 * @returns {Object} Result object with success status and new hash
 */
export function updateCombinedUrlHash(sfiaHash = '', lorHash = '') {
    try {
        let newHash = '';
        
        if (sfiaHash && lorHash) {
            newHash = `${sfiaHash}&&${lorHash}`;
        } else if (sfiaHash) {
            newHash = sfiaHash;
        } else if (lorHash) {
            newHash = `&&${lorHash}`;
        }
        
        window.location.hash = newHash;
        
        return {
            success: true,
            hash: newHash,
            sfiaHash,
            lorHash
        };
    } catch (error) {
        console.error('Error updating combined URL hash:', error);
        return {
            success: false,
            error: error.message,
            hash: '',
            sfiaHash,
            lorHash
        };
    }
}

/**
 * Validate hash format
 * @param {string} hash - Hash string to validate
 * @returns {Object} Validation result with details
 */
export function validateHashFormat(hash) {
    const result = {
        isValid: false,
        errors: [],
        warnings: [],
        sfiaPart: '',
        lorPart: ''
    };
    
    try {
        if (!hash || typeof hash !== 'string') {
            result.errors.push('Hash must be a non-empty string');
            return result;
        }
        
        const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
        const parts = cleanHash.split('&&');
        
        if (parts.length > 2) {
            result.errors.push('Hash contains too many && separators');
            return result;
        }
        
        const sfiaPart = parts[0] || '';
        const lorPart = parts[1] || '';
        
        result.sfiaPart = sfiaPart;
        result.lorPart = lorPart;
        
        // Validate SFIA part
        if (sfiaPart) {
            const sfiaSkills = parseSfiaCodesFromHash(`#${sfiaPart}`);
            if (sfiaSkills.length === 0 && sfiaPart.trim()) {
                result.warnings.push('SFIA part contains no valid skill codes');
            }
        }
        
        // Validate LoR part
        if (lorPart) {
            const lorValues = parseLorValuesFromHash(`#&&${lorPart}`);
            if (lorValues.length === 0 && lorPart.trim()) {
                result.warnings.push('LoR part contains no valid codes');
            }
        }
        
        result.isValid = result.errors.length === 0;
        return result;
        
    } catch (error) {
        result.errors.push(`Validation error: ${error.message}`);
        return result;
    }
}

export default {
    getStandardizedLorCode,
    parseSfiaCodesFromHash,
    parseLorValuesFromHash,
    generateSfiaHash,
    generateLorHash,
    updateCombinedUrlHash,
    validateHashFormat
};
