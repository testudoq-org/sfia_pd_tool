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
    test('should return true when export was recent', () => {
      // Set up timing scenario where export was recent
      const currentTime = 1000000000; // Fixed timestamp
      const timeoutDuration = 5000; // 5 seconds
      
      // Ensure lastExportTime is available in the function context
      global.lastExportTime = currentTime - 1000; // 1 second ago
      
      // Mock Date to return consistent time
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        getTime() {
          return currentTime;
        }
      };
      
      const result = isExportSkippedDueToTimeout(timeoutDuration);
      
      expect(result).toBe(true);
      
      // Restore original
      global.Date = originalDate;
    });

    test('should return false when export was long ago', () => {
      const currentTime = Date.now();
      global.lastExportTime = currentTime - 10000; // 10 seconds ago
      const timeoutDuration = 5000; // 5 seconds
      
      const result = isExportSkippedDueToTimeout(timeoutDuration);
      
      expect(result).toBe(false);
    });

    test('should return false when no previous export', () => {
      global.lastExportTime = 0;
      const timeoutDuration = 5000;
      
      const result = isExportSkippedDueToTimeout(timeoutDuration);
      
      expect(result).toBe(false);
    });

    test('should handle edge case of zero timeout', () => {
      const currentTime = Date.now();
      global.lastExportTime = currentTime - 1; // 1ms ago
      const timeoutDuration = 0;
      
      const result = isExportSkippedDueToTimeout(timeoutDuration);
      
      expect(result).toBe(false);
    });

    test('should handle negative timeout gracefully', () => {
      const currentTime = Date.now();
      global.lastExportTime = currentTime - 1000;
      const timeoutDuration = -1000;
      
      const result = isExportSkippedDueToTimeout(timeoutDuration);
      
      expect(result).toBe(false);
    });
  });
  describe('searchForText', () => {
    beforeEach(() => {
      // Set up DOM elements for testing
      document.body.innerHTML = `
        <input id="myInput" value="">
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
      `;
    });

    test('should filter rows based on search input', () => {
      const input = document.getElementById('myInput');
      input.value = 'BPTS';
      
      searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows.length).toBe(3); // Verify we have 3 rows
      expect(rows[0].style.display).toBe(''); // BPTS row should be visible
      expect(rows[1].style.display).toBe('none'); // ARCH row should be hidden
      expect(rows[2].style.display).toBe('none'); // SUST row should be hidden
    });

    test('should show all rows when search is empty', () => {
      const input = document.getElementById('myInput');
      input.value = '';
      
      searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      rows.forEach(row => {
        expect(row.style.display).toBe(''); // All rows should be visible
      });
    });

    test('should be case insensitive', () => {
      const input = document.getElementById('myInput');
      input.value = 'bpts'; // lowercase
      
      searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows[0].style.display).toBe(''); // BPTS row should be visible
    });

    test('should handle partial matches', () => {
      const input = document.getElementById('myInput');
      input.value = 'Acceptance';
      
      searchForText();
      
      const rows = document.querySelectorAll('#sfia-content tr');
      expect(rows[0].style.display).toBe(''); // BPTS row should be visible
      expect(rows[1].style.display).toBe('none'); // ARCH row should be hidden
    });

    test('should handle missing DOM elements gracefully', () => {
      // Remove input element
      document.getElementById('myInput').remove();
      
      // Should not throw error
      expect(() => {
        searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(console.error).toHaveBeenCalledWith("Input element not found.");
    });

    test('should handle missing table body gracefully', () => {
      // Setup DOM with table body first
      document.body.innerHTML = `
        <input id="myInput" value="test">
        <tbody id="sfia-content">
          <tr><td class="skill_key">Test</td></tr>
        </tbody>
      `;
      
      // Remove table body
      document.getElementById('sfia-content').remove();
      
      const input = document.getElementById('myInput');
      input.value = 'test';
      
      // Should not throw error
      expect(() => {
        searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(console.error).toHaveBeenCalledWith("Table body element not found.");
    });

    test('should handle rows without skill_key class', () => {
      document.body.innerHTML = `
        <input id="myInput" value="test">
        <tbody id="sfia-content">
          <tr>
            <td>No skill key class</td>
          </tr>
        </tbody>
      `;
      
      // Should not throw error
      expect(() => {
        searchForText();
      }).not.toThrow();
      
      // Check that error was logged
      expect(console.error).toHaveBeenCalledWith("Skill key element not found for row 0.");
    });
  });
});
