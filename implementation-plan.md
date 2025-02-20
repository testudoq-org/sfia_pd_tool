# JavaScript Organization Plan

## Current State
The application currently has JavaScript code in multiple locations:
1. Inline scripts in sfiapdgen.html
2. Multiple .js files that get concatenated into sfiapdgen_func.js
3. Build process that handles concatenation and minification

## Issues Identified
1. Duplicate theme toggle functionality exists in both sfiapdgen.html and theme.js
2. Local JSON loading code exists inline in sfiapdgen.html
3. Need to ensure proper loading order of JavaScript functionality

## Recommended Changes

### 1. Remove Duplicate Code
- Remove the inline theme toggle script from sfiapdgen.html (lines 294-312)
- The functionality already exists in theme.js
- theme.js is already included in the concatenation process

### 2. Move Local JSON Loading Code
- Move the inline JSON loading script (lines 315-332) to loadLocalJson.js
- Update loadLocalJson.js to include the file protocol check
- This maintains our single-responsibility principle for JavaScript files

### 3. Grunt Build Configuration
Current concatenation order is correct:
```javascript
src: ['src/init.js',
    'src/theme.js', 
    'src/constants.js', 
    'src/browserUpdate.js', 
    'src/dataFetching.js', 
    'src/loadLocalJson.js', 
    'src/exportFunctions.js', 
    'src/checkboxHandling.js', 
    'src/initializeContent.js', 
    'src/tableRendering.js', 
    'src/dataHandling.js', 
    'src/utilityFunctions.js', 
    'src/jsonHandling.js', 
    'src/urlHandling.js', 
    'src/eventListeners.js', 
    'src/windowEvents.js'],
```

This order ensures:
1. init.js loads first for any initialization needs
2. theme.js loads early to prevent theme flashing
3. Core functionality loads in a logical order
4. Event listeners and window events load last

No changes needed to the concatenation order.

## Benefits
1. Eliminates code duplication
2. Maintains clear separation of concerns
3. Keeps build process efficient
4. Makes future maintenance easier
5. Follows existing project patterns

## Implementation Steps
1. Remove duplicate theme toggle code from sfiapdgen.html
2. Move JSON loading code to loadLocalJson.js
3. Run build process to verify changes
4. Test functionality in both development and production environments

## Testing Considerations
1. Test theme switching functionality
2. Verify local JSON loading works
3. Check build output for correct concatenation
4. Validate minified file works in production
5. Run existing test suite using Grunt tasks

## Future Considerations
1. Consider adding JSDoc comments to all JavaScript files
2. Document the build process in README.md
3. Consider implementing source maps for better debugging
4. Add unit tests for JavaScript functions
