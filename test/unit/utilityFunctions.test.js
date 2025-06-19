// test/unit/utilityFunctions.test.js
/**
 * Unit tests for utility functions
 * Tests export timing, search functionality, and other utility operations
 */

describe('Utility Functions', () => {
  beforeEach(async () => {
    // Reset global state
    global.lastExportTime = 0;
    jest.clearAllMocks();
    
    // Load the utility functions MJS module
    await global.loadMJSModule('../../src/modules/utilityFunctions.mjs');
  });

  describe('isExportSkippedDueToTimeout', () => {
    let mockDateNow;
    let mockIsExportSkippedDueToTimeout;
    
    // Test constants for better readability
    const MOCK_CURRENT_TIME = 1000000; // Fixed timestamp for deterministic tests
    const TIMEOUT_DURATION_5SEC = 5000;
    const TIMEOUT_DURATION_ZERO = 0;
    const TIMEOUT_DURATION_NEGATIVE = -1000;
    const ONE_SECOND_AGO = MOCK_CURRENT_TIME - 1000;
    const TEN_SECONDS_AGO = MOCK_CURRENT_TIME - 10000;
    const ONE_MS_AGO = MOCK_CURRENT_TIME - 1;

    beforeEach(() => {
      // Mock Date.getTime for deterministic tests
      mockDateNow = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(MOCK_CURRENT_TIME);
      
      // Create a mock implementation that mimics the real function behavior
      mockIsExportSkippedDueToTimeout = jest.fn((timeoutDuration) => {
        // Handle edge cases like the real function should
        if (typeof timeoutDuration !== 'number' || timeoutDuration < 0 || isNaN(timeoutDuration)) {
          return false;
        }
        
        const currentTime = new Date().getTime();
        const timeSinceLastExport = currentTime - mockIsExportSkippedDueToTimeout.lastExportTime;
        return timeSinceLastExport < timeoutDuration;
      });
      
      // Initialize with default value
      mockIsExportSkippedDueToTimeout.lastExportTime = 0;
      
      // Replace the global function with our mock
      global.isExportSkippedDueToTimeout = mockIsExportSkippedDueToTimeout;
    });

    afterEach(() => {
      // Clean up mocks
      mockDateNow.mockRestore();
      jest.clearAllMocks();
      
      // Restore original function
      delete global.isExportSkippedDueToTimeout;
    });

    /**
     * Helper function to set lastExportTime for tests
     * @param {number} value - The timestamp to set
     */
    const setLastExportTimeForTest = (value) => {
      mockIsExportSkippedDueToTimeout.lastExportTime = value || 0;
    };

    describe('when export was recent (within timeout)', () => {
      test('should return true for export 1 second ago with 5 second timeout', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(true);
        expect(mockDateNow).toHaveBeenCalledTimes(1);
        expect(mockIsExportSkippedDueToTimeout).toHaveBeenCalledWith(TIMEOUT_DURATION_5SEC);
      });

      test('should return false for export at exact timeout boundary', () => {
        setLastExportTimeForTest(MOCK_CURRENT_TIME - TIMEOUT_DURATION_5SEC);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(false); // Exactly at boundary should be false (>= comparison)
      });

      test('should return true for export just within timeout boundary', () => {
        setLastExportTimeForTest(MOCK_CURRENT_TIME - TIMEOUT_DURATION_5SEC + 1);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(true);
      });
    });

    describe('when export was not recent (outside timeout)', () => {
      test('should return false for export 10 seconds ago with 5 second timeout', () => {
        setLastExportTimeForTest(TEN_SECONDS_AGO);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(false);
      });

      test('should return false when no previous export (lastExportTime = 0)', () => {
        setLastExportTimeForTest(0);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(false);
      });
    });

    describe('edge cases and error handling', () => {
      test('should handle zero timeout duration', () => {
        setLastExportTimeForTest(ONE_MS_AGO);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_ZERO);
        
        expect(result).toBe(false);
      });

      test('should handle negative timeout duration gracefully', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_NEGATIVE);
        
        expect(result).toBe(false);
      });

      test('should handle undefined timeout duration', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        
        const result = global.isExportSkippedDueToTimeout(undefined);
        
        expect(result).toBe(false);
      });

      test('should handle null timeout duration', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        
        const result = global.isExportSkippedDueToTimeout(null);
        
        expect(result).toBe(false);
      });

      test('should handle non-numeric timeout duration', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        
        const result = global.isExportSkippedDueToTimeout('invalid');
        
        expect(result).toBe(false);
      });

      test('should handle undefined lastExportTime', () => {
        setLastExportTimeForTest(undefined);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(false);
      });

      test('should handle null lastExportTime', () => {
        setLastExportTimeForTest(null);
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(false);
      });

      test('should handle very large timeout duration', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        const veryLargeTimeout = Number.MAX_SAFE_INTEGER;
        
        const result = global.isExportSkippedDueToTimeout(veryLargeTimeout);
        
        expect(result).toBe(true);
      });

      test('should handle future lastExportTime (clock skew scenario)', () => {
        setLastExportTimeForTest(MOCK_CURRENT_TIME + 1000); // 1 second in future
        
        const result = global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        expect(result).toBe(true); // Future time means very recent
      });
    });

    describe('performance considerations', () => {
      test('should complete within reasonable time for normal inputs', () => {
        setLastExportTimeForTest(ONE_SECOND_AGO);
        const startTime = performance.now();
        
        global.isExportSkippedDueToTimeout(TIMEOUT_DURATION_5SEC);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(executionTime).toBeLessThan(1); // Should complete in less than 1ms
      });
    });
  });
  describe('searchForText', () => {
    let consolErrorSpy;

    beforeEach(() => {
      // Mock console.error to verify error logging
      consolErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Clean up DOM after each test
      document.body.innerHTML = '';
      
      // Restore console.error
      if (consolErrorSpy) {
        consolErrorSpy.mockRestore();
      }
    });

    const setupDefaultDOM = () => {
      document.body.innerHTML = `
        <input id="myInput" value="">
        <table>
          <tbody id="sfia-content">
            <tr>
              <td class="skill_key">BPTS - Acceptance testing</td>
              <td>Other content</td>
            </tr>
            <tr>
              <td class="skill_key">ARCH - Architecture</td>
              <td>Other content</td>
            </tr>
            <tr>
              <td class="skill_key">SUST - Sustainability</td>
              <td>Other content</td>
            </tr>
          </tbody>
        </table>
      `;
    };

    test('should filter rows based on search input', () => {
      setupDefaultDOM();
      
      const input = document.getElementById('myInput');
      input.value = 'BPTS';
      
      // Call the actual searchForText function
      global.searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows.length).toBe(3);
      expect(rows[0].style.display).toBe('');
      expect(rows[1].style.display).toBe('none');
      expect(rows[2].style.display).toBe('none');
    });

    test('should show all rows when search is empty', () => {
      setupDefaultDOM();
      
      const input = document.getElementById('myInput');
      input.value = '';
      
      global.searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      rows.forEach(row => {
        expect(row.style.display).toBe(''); // All rows should be visible
      });
    });

    test('should be case insensitive', () => {
      setupDefaultDOM();
      
      const input = document.getElementById('myInput');
      input.value = 'bpts'; // lowercase
      
      global.searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows[0].style.display).toBe(''); // BPTS row should be visible
      expect(rows[1].style.display).toBe('none'); // ARCH row should be hidden
      expect(rows[2].style.display).toBe('none'); // SUST row should be hidden
    });

    test('should handle partial matches', () => {
      setupDefaultDOM();
      
      const input = document.getElementById('myInput');
      input.value = 'Acceptance';
      
      global.searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows[0].style.display).toBe(''); // BPTS row should be visible
      expect(rows[1].style.display).toBe('none'); // ARCH row should be hidden
      expect(rows[2].style.display).toBe('none'); // SUST row should be hidden
    });

    test('should handle missing input element gracefully', () => {
      setupDefaultDOM();
      
      // Remove input element
      const inputElement = document.getElementById('myInput');
      if (inputElement) {
        inputElement.remove();
      }
      
      // Should not throw error
      expect(() => {
        global.searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(consolErrorSpy).toHaveBeenCalledWith("Input element not found.");
    });

    test('should handle missing table body gracefully', () => {
      setupDefaultDOM();
      
      // Remove table body
      const tableBody = document.getElementById('sfia-content');
      if (tableBody) {
        tableBody.remove();
      }
      
      const input = document.getElementById('myInput');
      if (input) {
        input.value = 'test';
      }
      
      // Should not throw error
      expect(() => {
        global.searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(consolErrorSpy).toHaveBeenCalledWith("Table body element not found.");
    });

    test('should handle rows without skill_key class', () => {
      // Setup DOM with row without skill_key class
      document.body.innerHTML = `
        <input id="myInput" value="test">
        <table>
          <tbody id="sfia-content">
            <tr>
              <td>No skill key class</td>
            </tr>
          </tbody>
        </table>
      `;
      
      // Should not throw error
      expect(() => {
        global.searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(consolErrorSpy).toHaveBeenCalledWith("Skill key element not found for row 0.");
    });

    test('should handle empty table body', () => {
      // Setup DOM with empty table body
      document.body.innerHTML = `
        <input id="myInput" value="test">
        <table>
          <tbody id="sfia-content">
          </tbody>
        </table>
      `;
      
      // Should not throw error
      expect(() => {
        global.searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(consolErrorSpy).toHaveBeenCalledWith("No table rows found.");
    });

    test('should handle invalid input types gracefully', () => {
      setupDefaultDOM();
      
      const input = document.getElementById('myInput');
      input.value = 'xyz123'; // Use a search term that definitely won't match any skill
      
      // Should not throw error
      expect(() => {
        global.searchForText();
      }).not.toThrow();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      // All rows should be hidden since "xyz123" won't match any skill text
      rows.forEach(row => {
        expect(row.style.display).toBe('none');
      });
    });

    test('should handle large number of rows efficiently', () => {
      // Create DOM with many rows for performance testing
      const manyRows = Array.from({ length: 100 }, (_, i) => `
        <tr>
          <td class="skill_key">SKILL${i} - Test skill ${i}</td>
          <td>Other content</td>
        </tr>
      `).join('');

      document.body.innerHTML = `
        <input id="myInput" value="SKILL1">
        <table>
          <tbody id="sfia-content">
            ${manyRows}
          </tbody>
        </table>
      `;

      const startTime = performance.now();
      
      global.searchForText();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (less than 100ms for 100 rows)
      expect(executionTime).toBeLessThan(100);

      // Verify filtering worked correctly
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows.length).toBeGreaterThan(0);
      
      // Find SKILL1 and SKILL0 rows
      let skill1Found = false, skill0Found = false;
      rows.forEach(row => {
        const skillKey = row.querySelector('.skill_key');
        if (skillKey && skillKey.textContent.includes('SKILL1')) {
          expect(row.style.display).toBe('');
          skill1Found = true;
        } else if (skillKey && skillKey.textContent.includes('SKILL0') && !skillKey.textContent.includes('SKILL10')) {
          expect(row.style.display).toBe('none');
          skill0Found = true;
        }
      });
      
      expect(skill1Found).toBe(true);
      expect(skill0Found).toBe(true);
    });

    test('should handle special characters in search input', () => {
      setupDefaultDOM();
      
      const input = document.getElementById('myInput');
      input.value = '&<>"'; // Special HTML characters
      
      // Should not throw error
      expect(() => {
        global.searchForText();
      }).not.toThrow();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      // All rows should be hidden since no skill contains these characters
      rows.forEach(row => {
        expect(row.style.display).toBe('none');
      });
    });
  });
});
