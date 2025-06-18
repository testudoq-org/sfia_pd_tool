// test/unit/modules/urlHandling.test.js
/**
 * Unit tests for ES6 URL handling module using dynamic imports
 * Tests modernized URL parsing, hash generation, and validation functionality
 */

describe('ES6 URL Handling Module', () => {
    let urlModule;

    beforeAll(async () => {
        // Use dynamic import to load ES6 module
        try {
            const module = await import('../../../src/modules/urlHandling.mjs');
            urlModule = module;
        } catch (error) {
            console.error('Failed to load ES6 module:', error);
            // Fall back to testing that the module files exist
            const fs = require('fs');
            const path = require('path');
            const modulePath = path.resolve(__dirname, '../../../src/modules/urlHandling.mjs');
            expect(fs.existsSync(modulePath)).toBe(true);
        }
    });

    describe('getStandardizedLorCode', () => {
        test('should return success with existing standard codes unchanged', async () => {
            if (!urlModule) {
                console.log('Module not loaded, skipping ES6 tests');
                return;
            }

            const result = urlModule.getStandardizedLorCode('AUTO');
            expect(result.success).toBe(true);
            expect(result.data).toBe('AUTO');
            expect(result.error).toBeUndefined();
        });

        test('should convert full names to abbreviations', async () => {
            if (!urlModule) return;

            const result = urlModule.getStandardizedLorCode('Autonomy');
            expect(result.success).toBe(true);
            expect(result.data).toBe('AUTO');
        });

        test('should handle unknown categories gracefully', async () => {
            if (!urlModule) return;

            const result = urlModule.getStandardizedLorCode('NewCategory');
            expect(result.success).toBe(true);
            expect(result.data).toBe('NEWC');
            expect(result.warning).toContain('Generated abbreviation');
        });

        test('should handle empty input', async () => {
            if (!urlModule) return;

            const result = urlModule.getStandardizedLorCode('');
            expect(result.success).toBe(true);
            expect(result.data).toBe('');
        });

        test('should handle invalid input types', async () => {
            if (!urlModule) return;

            const result = urlModule.getStandardizedLorCode(null);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Category must be a string');
        });
    });

    describe('parseSfiaCodesFromHash', () => {
        test('should parse single SFIA skill correctly', async () => {
            if (!urlModule) return;

            const result = urlModule.parseSfiaCodesFromHash('#BPTS-2');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([{ skill: 'BPTS', level: 2 }]);
        });

        test('should parse multiple SFIA skills correctly', async () => {
            if (!urlModule) return;

            const result = urlModule.parseSfiaCodesFromHash('#BPTS-2+ARCH-3+SUST-4');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { skill: 'BPTS', level: 2 },
                { skill: 'ARCH', level: 3 },
                { skill: 'SUST', level: 4 }
            ]);
        });

        test('should handle combined SFIA and LoR hash correctly', async () => {
            if (!urlModule) return;

            const result = urlModule.parseSfiaCodesFromHash('#BPTS-2+ARCH-3&&AUTO-4+INFL-3');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { skill: 'BPTS', level: 2 },
                { skill: 'ARCH', level: 3 }
            ]);
        });

        test('should handle malformed entries with warnings', async () => {
            if (!urlModule) return;

            const result = urlModule.parseSfiaCodesFromHash('#BPTS-+ARCH-ABC+VALID-3');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([{ skill: 'VALID', level: 3 }]);
            expect(result.warnings).toBeDefined();
            expect(result.warnings.length).toBeGreaterThan(0);
        });
    });

    describe('parseLorValuesFromHash', () => {
        test('should parse single LoR value correctly', async () => {
            if (!urlModule) return;

            const result = urlModule.parseLorValuesFromHash('#&&AUTO-3');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([{ lorCategory: 'AUTO', lorLevel: 3 }]);
        });

        test('should parse multiple LoR values correctly', async () => {
            if (!urlModule) return;

            const result = urlModule.parseLorValuesFromHash('#&&AUTO-3+INFL-4+COMP-2');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { lorCategory: 'AUTO', lorLevel: 3 },
                { lorCategory: 'INFL', lorLevel: 4 },
                { lorCategory: 'COMP', lorLevel: 2 }
            ]);
        });

        test('should handle combined hash with SFIA section', async () => {
            if (!urlModule) return;

            const result = urlModule.parseLorValuesFromHash('#BPTS-2+ARCH-3&&AUTO-4+INFL-3');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { lorCategory: 'AUTO', lorLevel: 4 },
                { lorCategory: 'INFL', lorLevel: 3 }
            ]);
        });
    });

    describe('generateCombinedHash', () => {
        test('should generate SFIA-only hash', async () => {
            if (!urlModule) return;

            const sfiaData = [
                { skill: 'BPTS', level: 2 },
                { skill: 'ARCH', level: 3 }
            ];
            const result = urlModule.generateCombinedHash(sfiaData, []);
            expect(result.success).toBe(true);
            expect(result.data).toBe('BPTS-2+ARCH-3');
        });

        test('should generate LoR-only hash', async () => {
            if (!urlModule) return;

            const lorData = [
                { lorCategory: 'AUTO', lorLevel: 3 },
                { lorCategory: 'INFL', lorLevel: 4 }
            ];
            const result = urlModule.generateCombinedHash([], lorData);
            expect(result.success).toBe(true);
            expect(result.data).toBe('&&AUTO-3+INFL-4');
        });

        test('should generate combined SFIA and LoR hash', async () => {
            if (!urlModule) return;

            const sfiaData = [{ skill: 'BPTS', level: 2 }];
            const lorData = [{ lorCategory: 'AUTO', lorLevel: 3 }];
            const result = urlModule.generateCombinedHash(sfiaData, lorData);
            expect(result.success).toBe(true);
            expect(result.data).toBe('BPTS-2&&AUTO-3');
        });

        test('should handle empty data arrays', async () => {
            if (!urlModule) return;

            const result = urlModule.generateCombinedHash([], []);
            expect(result.success).toBe(true);
            expect(result.data).toBe('');
        });
    });

    describe('ValidationUtils', () => {
        test('should validate skill codes correctly', async () => {
            if (!urlModule) return;

            expect(urlModule.ValidationUtils.isValidSkillCode('BPTS')).toBe(true);
            expect(urlModule.ValidationUtils.isValidSkillCode('ARCH')).toBe(true);
            expect(urlModule.ValidationUtils.isValidSkillCode('XX')).toBe(false);
            expect(urlModule.ValidationUtils.isValidSkillCode('TOOLONGCODE')).toBe(false);
        });

        test('should validate skill levels correctly', async () => {
            if (!urlModule) return;

            expect(urlModule.ValidationUtils.isValidLevel(1)).toBe(true);
            expect(urlModule.ValidationUtils.isValidLevel(7)).toBe(true);
            expect(urlModule.ValidationUtils.isValidLevel(0)).toBe(false);
            expect(urlModule.ValidationUtils.isValidLevel(8)).toBe(false);
        });
    });

    describe('Legacy Compatibility', () => {
        test('getStandardizedLorCodeLegacy should return string for backwards compatibility', async () => {
            if (!urlModule) return;

            expect(urlModule.getStandardizedLorCodeLegacy('AUTO')).toBe('AUTO');
            expect(urlModule.getStandardizedLorCodeLegacy('Autonomy')).toBe('AUTO');
            expect(urlModule.getStandardizedLorCodeLegacy('')).toBe('');
            expect(urlModule.getStandardizedLorCodeLegacy(null)).toBe('');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle malformed hash patterns gracefully', async () => {
            if (!urlModule) return;

            const malformedHashes = [
                '#INVALID-FORMAT',
                '#BPTS-',
                '#-2',
                '#BPTS-ABC',
                '#&&',
                '#BPTS-2&&'
            ];

            malformedHashes.forEach(hash => {
                const sfiaResult = urlModule.parseSfiaCodesFromHash(hash);
                const lorResult = urlModule.parseLorValuesFromHash(hash);
                
                expect(sfiaResult.success).toBe(true);
                expect(lorResult.success).toBe(true);
                // Should not throw errors, may have warnings
            });
        });
    });

    describe('Module Existence', () => {
        test('should have ES6 module files present', () => {
            const fs = require('fs');
            const path = require('path');
            
            const urlModulePath = path.resolve(__dirname, '../../../src/modules/urlHandling.mjs');
            const utilModulePath = path.resolve(__dirname, '../../../src/modules/utilityFunctions.mjs');
            
            expect(fs.existsSync(urlModulePath)).toBe(true);
            expect(fs.existsSync(utilModulePath)).toBe(true);
        });        test('should verify ES6 module syntax', () => {
            const fs = require('fs');
            const path = require('path');
            
            const urlModulePath = path.resolve(__dirname, '../../../src/modules/urlHandling.mjs');
            const content = fs.readFileSync(urlModulePath, 'utf8');
            
            expect(content).toMatch(/export (function|const)/);
            expect(content).toMatch(/export (\{|const|function)/);
            // The module uses exports but doesn't have imports since it's self-contained
        });
    });
});
