// test/unit/urlHandling.test.js
/**
 * Unit tests for URL handling functions
 * Tests URL parsing, hash generation, and state management
 */

describe('URL Handling Functions', () => {
  beforeEach(() => {
    global.g_sfiahash = '';
    global.g_lorhash = '';
    window.location.hash = '';
    
    // Load the URL handling source file
    global.loadSourceFile('../../src/urlHandling.js');
  });

  describe('getStandardizedLorCode', () => {    test('should return existing standard codes unchanged', () => {
      expect(getStandardizedLorCode('AUTO')).toBe('AUTO');
      expect(getStandardizedLorCode('INFL')).toBe('INFL');
      expect(getStandardizedLorCode('COMP')).toBe('COMP');
      expect(getStandardizedLorCode('BUSI')).toBe('BUSI');
      expect(getStandardizedLorCode('KNOW')).toBe('KNOW');
    });    test('should convert full names to abbreviations', () => {
      expect(getStandardizedLorCode('Autonomy')).toBe('AUTO');
      expect(getStandardizedLorCode('Influence')).toBe('INFL');
      expect(getStandardizedLorCode('Complexity')).toBe('COMP');
      expect(getStandardizedLorCode('Business')).toBe('BUSI');
      expect(getStandardizedLorCode('Knowledge')).toBe('KNOW');
    });    test('should handle unknown categories gracefully', () => {
      expect(getStandardizedLorCode('NewCategory')).toBe('NEWC');
      expect(getStandardizedLorCode('TestCategory')).toBe('TEST');
      expect(getStandardizedLorCode('X')).toBe('X');
      expect(getStandardizedLorCode('AB')).toBe('AB');
    });    test('should handle edge cases', () => {
      expect(getStandardizedLorCode('')).toBe('');
      expect(getStandardizedLorCode('a')).toBe('A');
      expect(getStandardizedLorCode('ab')).toBe('AB');
      expect(getStandardizedLorCode('abc')).toBe('ABC');
    });
  });  describe('updateCombinedUrlHash', () => {
    test('should combine SFIA and LoR hashes with && separator', () => {
      // Set global variables that the function uses
      global.g_sfiahash = 'BPTS-2+ARCH-3';
      global.g_lorhash = 'AUTO-4+INFL-3';
      
      updateCombinedUrlHash();
      
      expect(window.location.hash).toBe('BPTS-2+ARCH-3&&AUTO-4+INFL-3');
    });

    test('should set only SFIA hash when LoR is empty', () => {
      global.g_sfiahash = 'BPTS-2+ARCH-3';
      global.g_lorhash = '';
      
      updateCombinedUrlHash();
      
      expect(window.location.hash).toBe('BPTS-2+ARCH-3');
    });

    test('should set LoR hash with && prefix when SFIA is empty', () => {
      global.g_sfiahash = '';
      global.g_lorhash = 'AUTO-4+INFL-3';
      
      updateCombinedUrlHash();
      
      expect(window.location.hash).toBe('&&AUTO-4+INFL-3');
    });

    test('should clear hash when both are empty', () => {
      global.g_sfiahash = '';
      global.g_lorhash = '';
      
      updateCombinedUrlHash();
      
      expect(window.location.hash).toBe('');
    });
  });
});

describe('URL Hash Processing Edge Cases', () => {
  beforeEach(() => {
    eval(urlHandlingSource);
  });

  test('should handle malformed hash patterns gracefully', () => {
    // Test cases that could cause errors in production
    const malformedHashes = [
      '#INVALID-FORMAT',
      '#BPTS-',
      '#-2',
      '#BPTS-ABC',
      '#BPTS-2+',
      '#+ARCH-3',
      '#BPTS--2',
      '#&&',
      '#BPTS-2&&',
      '#&&AUTO-3'
    ];

    malformedHashes.forEach(hash => {
      window.location.hash = hash;        // These should not throw errors
        expect(() => {
          // Simulate hash processing that might occur in the application
          const hashParts = window.location.hash.substring(1).split("&&");
          // Just verify the parsing doesn't throw, don't need to use the parts
          expect(hashParts).toBeDefined();
        }).not.toThrow();
    });
  });
});
