# SFIA PD Generator Modernization Plan

## 1. Dependencies Update

### Current Dependencies
- Bootstrap 3.3.7
- jQuery 3.5.1
- wysihtml5 0.3.0
- Ace editor 1.32.6

### Planned Updates
- Bootstrap -> 5.3.x
  - Replace all Bootstrap 3 classes with Bootstrap 5 equivalents
  - Update grid system classes
  - Replace panels with cards
  - Modernize navbar structure
- jQuery -> 3.7.1
- Remove wysihtml5 completely
- Ace editor -> latest stable (currently 1.32.6 -> 1.32.8)

## 2. Layout Improvements

### Navigation
- Update navbar structure to Bootstrap 5 format
- Improve hamburger menu implementation
- Enhanced mobile responsiveness

### Grid System
- Replace old grid classes:
  - col-xs-12 -> col-12
  - col-lg-8 -> col-lg-8 (remains same)
  - Add proper gutters and spacing
  - Implement consistent container usage

### Components
- Replace panels with cards
- Update form layouts
- Improve button styling
- Add proper spacing utilities
- Enhanced table responsiveness

### Editor Integration
- Remove wysihtml5 editors
- Expand Ace editor implementation
- Improve editor layout and controls

## 3. JavaScript Considerations

### Build Process Impact
- sfiapdgen_func.js is built from multiple source files:
  - constants.js
  - browserUpdate.js
  - dataFetching.js
  - exportFunctions.js
  - checkboxHandling.js
  - initializeContent.js
  - tableRendering.js
  - dataHandling.js
  - utilityFunctions.js
  - jsonHandling.js
  - urlHandling.js
  - eventListeners.js
  - windowEvents.js

### Required JavaScript Updates
- Update jQuery selectors and methods if needed
- Remove wysihtml5 initialization and related code
- Update Bootstrap JavaScript initialization
- Enhance Ace editor integration
- Ensure compatibility with concatenated build

## 4. Testing Considerations

The Gruntfile includes multiple test configurations:
- Local testing
- Distribution testing
- Production testing

Need to ensure all updates are tested across these environments.

## Implementation Strategy

1. Create backup of current working version
2. Update core dependencies first
3. Implement layout improvements
4. Remove wysihtml5 and enhance Ace editor
5. Test thoroughly using existing test configurations
6. Create documentation for changes

## Timeline

1. Dependencies Update: 2-3 hours
2. Layout Improvements: 4-5 hours
3. JavaScript Updates: 3-4 hours
4. Testing and Fixes: 2-3 hours

Total Estimated Time: 11-15 hours
