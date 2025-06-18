// test/unit/checkboxHandling.test.js
/**
 * Unit tests for checkbox handling functions
 * Tests SFIA skill selection, URL hash parsing, and checkbox state management
 */

describe('Checkbox Handling Functions', () => {
  beforeEach(async () => {
    // Reset global state
    window.location.hash = '';
    jest.clearAllMocks();
    
    // Load the checkbox handling MJS module
    await global.loadMJSModule('../../src/modules/checkboxHandling.mjs');
  });

  describe('checkSfiaPreselected', () => {
    test('should return true for skills present in hash', () => {
      window.location.hash = '#BPTS-2+ARCH-3+SUST-4';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
      expect(checkSfiaPreselected('SUST', 4)).toBe(true);
    });

    test('should return false for skills not in hash', () => {
      window.location.hash = '#BPTS-2+ARCH-3';
      
      expect(checkSfiaPreselected('SUST', 4)).toBe(false);
      expect(checkSfiaPreselected('BPTS', 3)).toBe(false); // Wrong level
      expect(checkSfiaPreselected('DIFFERENT', 2)).toBe(false); // Wrong code
    });

    test('should handle combined SFIA and LoR hash correctly', () => {
      window.location.hash = '#BPTS-2+ARCH-3&&AUTO-4+INFL-3';
      
      // Should find SFIA skills in the first part
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
      
      // Should not find LoR codes in SFIA part
      expect(checkSfiaPreselected('AUTO', 4)).toBe(false);
      expect(checkSfiaPreselected('INFL', 3)).toBe(false);
    });

    test('should handle LoR-only hash correctly', () => {
      window.location.hash = '#&&AUTO-4+INFL-3';
      
      // Should return false since there's no SFIA part
      expect(checkSfiaPreselected('AUTO', 4)).toBe(false);
      expect(checkSfiaPreselected('BPTS', 2)).toBe(false);
    });

    test('should handle empty hash', () => {
      window.location.hash = '';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(false);
    });

    test('should handle malformed hash entries gracefully', () => {
      window.location.hash = '#BPTS-2+INVALID+ARCH-3+-4+CODE-';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
      
      // Should not crash on malformed entries
      expect(() => {
        checkSfiaPreselected('INVALID', 1);
        checkSfiaPreselected('CODE', 4);
      }).not.toThrow();
    });

    test('should handle hash with only separator', () => {
      window.location.hash = '#&&';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(false);
    });

    test('should handle non-numeric levels gracefully', () => {
      window.location.hash = '#BPTS-ABC+ARCH-3';
      
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
      
      // Should handle non-numeric level gracefully
      expect(() => {
        checkSfiaPreselected('BPTS', 2);
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle multiple consecutive separators', () => {
      window.location.hash = '#BPTS-2++ARCH-3';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
    });

    test('should handle hash starting with separator', () => {
      window.location.hash = '#+BPTS-2+ARCH-3';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
    });

    test('should handle hash ending with separator', () => {
      window.location.hash = '#BPTS-2+ARCH-3+';
      
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
    });

    test('should handle very long skill codes', () => {
      window.location.hash = '#VERYLONGSKILLCODE-2+ARCH-3';
      
      expect(checkSfiaPreselected('VERYLONGSKILLCODE', 2)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 3)).toBe(true);
    });

    test('should handle high skill levels', () => {
      window.location.hash = '#BPTS-7+ARCH-10+SUST-999';
      
      expect(checkSfiaPreselected('BPTS', 7)).toBe(true);
      expect(checkSfiaPreselected('ARCH', 10)).toBe(true);
      expect(checkSfiaPreselected('SUST', 999)).toBe(true);
    });

    test('should handle zero and negative levels', () => {
      window.location.hash = '#BPTS-0+ARCH--1+SUST-2';
      
      expect(checkSfiaPreselected('BPTS', 0)).toBe(true);
      expect(checkSfiaPreselected('SUST', 2)).toBe(true);
      
      // Negative level should still be parsed as a number
      expect(() => {
        checkSfiaPreselected('ARCH', -1);
      }).not.toThrow();
    });
  });
});
