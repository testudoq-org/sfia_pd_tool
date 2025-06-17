// Clean ES6 URL Handling Module for SFIA PD Generator
// Contains enhanced URL processing functionality

/**
 * Level of Responsibility abbreviations mapping
 */
const LOR_ABBREVIATIONS = {
    'Autonomy': 'AUTN',
    'Influence': 'INFL',
    'Complexity': 'CPLX',
    'Business Skills': 'BSKL',
    'Knowledge': 'KNOW'
};

/**
 * Validation utilities for SFIA codes and levels
 */
export const ValidationUtils = {
    /**
     * Validates if a skill code is properly formatted
     * @param {string} code - The skill code to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidSkillCode(code) {
        if (typeof code !== 'string') return false;
        return /^[A-Z]{2,6}$/.test(code);
    },

    /**
     * Validates if a skill level is within SFIA range (1-7)
     * @param {number} level - The skill level to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidLevel(level) {
        const num = parseInt(level);
        return !isNaN(num) && num >= 1 && num <= 7;
    }
};

/**
 * Converts full LoR category names to standardized abbreviations
 * @param {string} category - LoR category
 * @returns {Object} Result object with success status and data
 */
export function getStandardizedLorCode(category) {
    // Input validation
    if (typeof category !== 'string') {
        return {
            success: false,
            error: 'getStandardizedLorCode: Invalid input type, expected string',
            data: ''
        };
    }
    
    // First check if it's already a standard code
    if (Object.values(LOR_ABBREVIATIONS).includes(category)) {
        return {
            success: true,
            data: category
        };
    }
    
    // Then check if we have a mapping for it
    const abbreviated = LOR_ABBREVIATIONS[category];
    if (abbreviated) {
        return {
            success: true,
            data: abbreviated
        };
    }
    
    // If no mapping exists, create a standardized 4-letter code
    return {
        success: true,
        data: category.substring(0, 4).toUpperCase(),
        warnings: [`No standard mapping found for "${category}", using truncated version`]
    };
}

/**
 * Parse SFIA codes from URL hash
 * @param {string} hash - URL hash string (optional, defaults to current location)
 * @returns {Object} Result object with success status and parsed data
 */
export function parseSfiaCodesFromHash(hash = null) {
    try {
        const targetHash = hash || (typeof window !== 'undefined' ? window.location.hash : '');
        
        if (!targetHash) {
            return {
                success: true,
                data: []
            };
        }
        
        // Remove # symbol and get SFIA part (before &&)
        const cleanHash = targetHash.substring(1);
        const sfiaPart = cleanHash.split('&&')[0];
        
        if (!sfiaPart) {
            return {
                success: true,
                data: []
            };
        }
        
        const hashLevels = sfiaPart.split("+").filter(level => level.trim());
        const parsedSkills = [];
        const warnings = [];
        
        for (const level of hashLevels) {
            const parts = level.split("-");
            if (parts.length === 2) {
                const code = parts[0].trim();
                const skillLevel = parseInt(parts[1]);
                
                if (code && ValidationUtils.isValidLevel(skillLevel)) {
                    parsedSkills.push({ code, level: skillLevel });
                } else {
                    warnings.push(`Invalid SFIA entry: ${level}`);
                }
            } else {
                warnings.push(`Malformed SFIA entry: ${level}`);
            }
        }
        
        return {
            success: true,
            data: parsedSkills,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    } catch (error) {
        return {
            success: false,
            error: `Error parsing SFIA codes from hash: ${error.message}`,
            data: []
        };
    }
}

/**
 * Parse LoR values from URL hash
 * @param {string} hash - URL hash string (optional, defaults to current location)
 * @returns {Object} Result object with success status and parsed data
 */
export function parseLorValuesFromHash(hash = null) {
    try {
        const targetHash = hash || (typeof window !== 'undefined' ? window.location.hash : '');
        
        if (!targetHash) {
            return {
                success: true,
                data: []
            };
        }
        
        // Remove # symbol and get LoR part (after &&)
        const cleanHash = targetHash.substring(1);
        const hashParts = cleanHash.split('&&');
        
        if (hashParts.length < 2) {
            return {
                success: true,
                data: []
            };
        }
        
        const lorPart = hashParts[1];
        if (!lorPart) {
            return {
                success: true,
                data: []
            };
        }
        
        const lorLevels = lorPart.split("+").filter(level => level.trim());
        const parsedLor = [];
        
        for (const level of lorLevels) {
            const parts = level.split("-");
            if (parts.length === 2) {
                const category = parts[0].trim();
                const levelNum = parseInt(parts[1]);
                
                if (category && !isNaN(levelNum)) {
                    // Standardize the category
                    const standardResult = getStandardizedLorCode(category);
                    if (standardResult.success) {
                        parsedLor.push({ 
                            category: standardResult.data, 
                            level: levelNum 
                        });
                    }
                }
            }
        }
        
        return {
            success: true,
            data: parsedLor
        };
    } catch (error) {
        return {
            success: false,
            error: `Error parsing LoR values from hash: ${error.message}`,
            data: []
        };
    }
}

/**
 * Generate a combined hash string from SFIA and LoR data
 * @param {Array} sfiaData - Array of SFIA skill objects {code, level}
 * @param {Array} lorData - Array of LoR objects {category, level}
 * @returns {Object} Result object with success status and generated hash
 */
export function generateCombinedHash(sfiaData = [], lorData = []) {
    try {
        // Validate inputs
        if (!Array.isArray(sfiaData) || !Array.isArray(lorData)) {
            return {
                success: false,
                error: 'generateCombinedHash: Both parameters must be arrays',
                data: ''
            };
        }
        
        let hashParts = [];
        
        // Build SFIA part
        if (sfiaData.length > 0) {
            const sfiaStrings = sfiaData.map(skill => `${skill.code}-${skill.level}`);
            hashParts.push(sfiaStrings.join('+'));
        }
        
        // Build LoR part
        if (lorData.length > 0) {
            const lorStrings = lorData.map(lor => `${lor.category}-${lor.level}`);
            if (hashParts.length > 0) {
                hashParts.push('&&' + lorStrings.join('+'));
            } else {
                hashParts.push('&&' + lorStrings.join('+'));
            }
        }
        
        return {
            success: true,
            data: hashParts.join('')
        };
    } catch (error) {
        return {
            success: false,
            error: `Error generating combined hash: ${error.message}`,
            data: ''
        };
    }
}

console.log('ES6 URL Handling Module loaded');
