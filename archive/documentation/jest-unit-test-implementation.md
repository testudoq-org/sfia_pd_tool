# Jest Unit Test Implementation Plan

**Date:** 2025-06-17  
**Purpose:** Analyze E2E test coverage and identify areas for enhanced Jest unit test coverage  
**Status:** Analysis Complete - Ready for Implementation

## Executive Summary

Based on analysis of the E2E test results and source code, this document identifies specific areas where Jest unit tests would significantly enhance test coverage and complement the existing E2E test suite. The current E2E tests provide excellent integration coverage (95-100% pass rate) but lack granular unit-level validation of individual functions and modules.

## Current E2E Test Coverage Analysis

### ✅ Well-Covered Areas (E2E Level)
- **Basic Functionality**: Page load, navigation, element visibility
- **Search Operations**: Table filtering, input responsiveness
- **URL Hash Processing**: Complex SFIA+LoR combinations, state persistence
- **Interactive Elements**: Checkbox state management, form interactions
- **Export Functions**: HTML/CSV generation and download
- **JSON Version Management**: Version switching, cookie persistence
- **API Integration**: Key management and validation

### 🔍 Gap Analysis: Areas Needing Unit Test Coverage

#### 1. **Pure Function Logic** (Currently only tested via E2E)
- URL parsing and hash manipulation
- Data transformation and validation
- Utility functions and calculations
- String formatting and content generation

#### 2. **Error Handling and Edge Cases** (Limited E2E coverage)
- Invalid input validation
- Malformed data handling
- Network failure scenarios
- Browser compatibility edge cases

#### 3. **Build Process Validation** (No current coverage)
- File concatenation integrity
- Source map accuracy
- Minification effectiveness
- Asset copying completeness

## Recommended Jest Unit Test Implementation

### Phase 1: Core Utility Functions

#### **1.1 URL Handling Module (`src/urlHandling.js`)**

**Target Functions:**
```javascript
// High-priority unit tests needed
- getStandardizedLorCode(category)
- parseLorValuesFromHash()
- generateUrlHash(lorJson, sfiaJson)
- generateLorHash(lorJson)
- generateSfiaHash(sfiaJson)
- updateCombinedUrlHash()
```

**Recommended Test Cases:**
```javascript
describe('urlHandling', () => {
  describe('getStandardizedLorCode', () => {
    test('should return existing standard codes unchanged', () => {
      expect(getStandardizedLorCode('AUTO')).toBe('AUTO');
      expect(getStandardizedLorCode('INFL')).toBe('INFL');
    });
    
    test('should convert full names to abbreviations', () => {
      expect(getStandardizedLorCode('Autonomy')).toBe('AUTO');
      expect(getStandardizedLorCode('Influence')).toBe('INFL');
    });
    
    test('should handle unknown categories gracefully', () => {
      expect(getStandardizedLorCode('NewCategory')).toBe('NEWC');
      expect(getStandardizedLorCode('X')).toBe('X');
    });
  });

  describe('parseLorValuesFromHash', () => {
    test('should parse single LoR value correctly', () => {
      // Mock window.location.hash
      Object.defineProperty(window, 'location', {
        value: { hash: '#&&AUTO-3' }
      });
      const result = parseLorValuesFromHash();
      expect(result).toEqual([{ lorCategory: 'AUTO', lorLevel: 3 }]);
    });
    
    test('should handle malformed hash gracefully', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#&&INVALID' }
      });
      const result = parseLorValuesFromHash();
      expect(result).toEqual([]);
    });
  });
});
```

#### **1.2 Checkbox Handling Module (`src/checkboxHandling.js`)**

**Target Functions:**
```javascript
- checkSfiaPreselected(code, level)
- addSfiaSelectionBox(index, sfiaJson, rootKey, subKey, skillKey, code)
```

**Recommended Test Cases:**
```javascript
describe('checkboxHandling', () => {
  describe('checkSfiaPreselected', () => {
    test('should return true for preselected skills', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#BPTS-2+BSMO-3' }
      });
      expect(checkSfiaPreselected('BPTS', 2)).toBe(true);
      expect(checkSfiaPreselected('BSMO', 3)).toBe(true);
    });
    
    test('should return false for non-preselected skills', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#BPTS-2' }
      });
      expect(checkSfiaPreselected('BPTS', 3)).toBe(false);
      expect(checkSfiaPreselected('OTHER', 2)).toBe(false);
    });
    
    test('should handle malformed hash gracefully', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#INVALID-HASH' }
      });
      expect(checkSfiaPreselected('BPTS', 2)).toBe(false);
    });
  });
});
```

#### **1.3 Utility Functions Module (`src/utilityFunctions.js`)**

**Target Functions:**
```javascript
- isExportSkippedDueToTimeout(timeoutDuration)
- formatContentAsQuestions(sfiaContent, lorContent)
- searchForText() // DOM manipulation logic
```

**Recommended Test Cases:**
```javascript
describe('utilityFunctions', () => {
  describe('isExportSkippedDueToTimeout', () => {
    test('should return true if within timeout', () => {
      // Set lastExportTime to recent timestamp
      global.lastExportTime = Date.now() - 1000; // 1 second ago
      expect(isExportSkippedDueToTimeout(2000)).toBe(true);
    });
    
    test('should return false if outside timeout', () => {
      global.lastExportTime = Date.now() - 5000; // 5 seconds ago
      expect(isExportSkippedDueToTimeout(2000)).toBe(false);
    });
  });

  describe('formatContentAsQuestions', () => {
    test('should extract headers correctly', () => {
      const sfiaContent = '<h1>Skill Header</h1><p>Content</p>';
      const lorContent = '<h2>LoR Header</h2><p>Description</p>';
      const result = formatContentAsQuestions(sfiaContent, lorContent);
      expect(result).toContain('# Skill Header');
      expect(result).toContain('## LoR Header');
    });
    
    test('should handle empty content gracefully', () => {
      const result = formatContentAsQuestions('', '');
      expect(result).toContain('# SFIA Skills and Responsibilities Summary');
    });
  });
});
```

### Phase 2: Data Processing and Validation

#### **2.1 JSON Handling Module (`src/jsonHandling.js`)**

**Target Functions:**
```javascript
- changeJsonVersion() // Path construction logic
```

**Recommended Test Cases:**
```javascript
describe('jsonHandling', () => {
  describe('changeJsonVersion', () => {
    test('should construct correct URLs for different environments', () => {
      // Test localhost with package/dev
      Object.defineProperty(window, 'location', {
        value: { 
          hostname: '127.0.0.1',
          pathname: '/sfiapdgen.html',
          origin: 'http://127.0.0.1:5501'
        }
      });
      
      // Mock fetch to capture the URL being requested
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });
      global.fetch = mockFetch;
      
      // Mock DOM elements
      document.getElementById = jest.fn().mockReturnValue({
        value: 'json_source_v8'
      });
      
      changeJsonVersion();
      
      expect(mockFetch).toHaveBeenCalledWith('json_source_v8.json');
    });
  });
});
```

#### **2.2 Export Functions Module (`src/exportFunctions.js`)**

**Target Functions:**
```javascript
- processCheckedBoxes(checkedBoxes, sfiaJson)
- generateCSVContent(data)
- getCheckedBoxes()
```

**Recommended Test Cases:**
```javascript
describe('exportFunctions', () => {
  describe('generateCSVContent', () => {
    test('should format data correctly as CSV', () => {
      const testData = [
        ['Skill1', 'Description1', 'Level1'],
        ['Skill2', 'Description2', 'Level2']
      ];
      const result = generateCSVContent(testData);
      expect(result).toBe('"Skill1","Description1","Level1"\n"Skill2","Description2","Level2"\n');
    });
    
    test('should handle empty data', () => {
      const result = generateCSVContent([]);
      expect(result).toBe('');
    });
    
    test('should escape quotes in data', () => {
      const testData = [['Skill "Test"', 'Description', 'Level']];
      const result = generateCSVContent(testData);
      expect(result).toContain('"Skill \\"Test\\""');
    });
  });
});
```

### Phase 3: Build Process and Integration Testing

#### **3.1 Build Process Validation**

**Target Areas:**
- File concatenation integrity
- Source map generation
- Asset copying completeness

**Recommended Test Cases:**
```javascript
describe('Build Process', () => {
  describe('File Concatenation', () => {
    test('should include all source files in correct order', async () => {
      const builtFile = await fs.readFile('package/dev/sfiapdgen_func.js', 'utf8');
      
      // Verify all source files are included
      expect(builtFile).toContain('// BOF: src/constants.js');
      expect(builtFile).toContain('// BOF: src/dataFetching.js');
      expect(builtFile).toContain('// BOF: src/utilityFunctions.js');
      
      // Verify order is correct
      const constantsIndex = builtFile.indexOf('src/constants.js');
      const dataFetchingIndex = builtFile.indexOf('src/dataFetching.js');
      expect(constantsIndex).toBeLessThan(dataFetchingIndex);
    });
    
    test('should maintain function integrity after concatenation', () => {
      const builtFile = require('../package/dev/sfiapdgen_func.js');
      // Test that key functions are still accessible
      expect(typeof getStandardizedLorCode).toBe('function');
      expect(typeof checkSfiaPreselected).toBe('function');
    });
  });
});
```

### Phase 4: Error Handling and Edge Cases

#### **4.1 Error Boundary Testing**

**Target Areas:**
- Network failure handling
- Invalid JSON processing
- DOM manipulation errors

**Recommended Test Cases:**
```javascript
describe('Error Handling', () => {
  describe('Network Failures', () => {
    test('should handle fetch failures gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      console.error = jest.fn();
      
      await changeJsonVersion();
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('There was a problem with the fetch request')
      );
    });
  });
  
  describe('DOM Manipulation', () => {
    test('should handle missing DOM elements', () => {
      document.getElementById = jest.fn().mockReturnValue(null);
      console.error = jest.fn();
      
      searchForText();
      
      expect(console.error).toHaveBeenCalledWith('Input element not found.');
    });
  });
});
```

## Implementation Strategy

### **Setup Requirements**

#### **Package.json Updates**
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@jest/environment-jsdom": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  },
  "scripts": {
    "test:unit": "jest",
    "test:unit:watch": "jest --watch",
    "test:unit:coverage": "jest --coverage",
    "test:all": "npm run test:unit && npm run codeceptjs"
  }
}
```

#### **Jest Configuration (`jest.config.js`)**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
  testMatch: [
    '<rootDir>/test/unit/**/*.test.js',
    '<rootDir>/test/unit/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.min.js',
    '!package/**/*'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### **Directory Structure**
```
test/
├── unit/                    # Jest unit tests
│   ├── urlHandling.test.js
│   ├── checkboxHandling.test.js
│   ├── utilityFunctions.test.js
│   ├── jsonHandling.test.js
│   ├── exportFunctions.test.js
│   └── dataHandling.test.js
├── integration/             # Build process tests
│   ├── build.test.js
│   └── concatenation.test.js
├── setup/                   # Test configuration
│   ├── jest.setup.js
│   └── mocks/
│       ├── dom.js
│       └── fetch.js
└── ui/                      # Existing E2E tests
```

### **Test Execution Strategy**

#### **Development Workflow**
1. **Pre-commit**: Run unit tests (`npm run test:unit`)
2. **CI/CD Pipeline**: Run full test suite (`npm run test:all`)
3. **Coverage Reports**: Generate coverage after each build
4. **Watch Mode**: Use during development (`npm run test:unit:watch`)

#### **Coverage Targets**
- **Unit Test Coverage**: 80%+ for utility functions
- **Integration Coverage**: 90%+ when combined with E2E
- **Critical Path Coverage**: 100% for URL handling and data processing

## Benefits of Jest Unit Test Implementation

### **1. Complementary Coverage**
- **E2E Tests**: Validate user workflows and integration
- **Unit Tests**: Validate individual function logic and edge cases
- **Combined**: Comprehensive coverage from UI to utility level

### **2. Development Efficiency**
- **Faster Feedback**: Unit tests execute in milliseconds vs. seconds for E2E
- **Isolated Testing**: Test individual functions without browser overhead
- **Debugging**: Pinpoint exact failure location more easily

### **3. Refactoring Confidence**
- **Safe Refactoring**: Unit tests catch breaking changes immediately
- **API Stability**: Ensure function contracts remain stable
- **Performance**: Validate optimization efforts don't break functionality

### **4. Documentation Value**
- **Living Documentation**: Tests serve as usage examples
- **Edge Case Documentation**: Capture known limitations and behaviors
- **API Contracts**: Clear function input/output expectations

## Migration Considerations

### **Current State Compatibility**
- **No Breaking Changes**: Unit tests complement existing E2E suite
- **Gradual Implementation**: Can be implemented incrementally
- **Build Process**: Independent of the Vite build process.

### **Resource Requirements**
- **Initial Setup**: ~1-2 days for configuration and first test suite
- **Ongoing Maintenance**: ~20% additional effort for test updates
- **CI/CD Integration**: Minimal changes to existing pipeline

## Conclusion

The Jest unit test implementation will significantly enhance the project's test coverage by providing granular validation of utility functions, error handling, and build processes. This complements the excellent E2E test coverage (95-100% pass rate) and creates a robust, multi-layered testing strategy.

**Priority Implementation Order:**
1. **Phase 1**: Core utility functions (highest ROI)
2. **Phase 4**: Error handling (critical for reliability)
3. **Phase 2**: Data processing (important for data integrity)
4. **Phase 3**: Build process (valuable for CI/CD confidence)

The proposed implementation maintains backward compatibility while adding significant value for future development and maintenance activities.
