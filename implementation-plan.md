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
4. CORS policy restrictions on local file access
5. Bootstrap collapse functionality not working
6. File input element not found errors

## Recommended Changes

### 1. Remove Duplicate Code
- Remove the inline theme toggle script from sfiapdgen.html (lines 294-312)
- The functionality already exists in theme.js
- theme.js is already included in the concatenation process

### 2. Move Local JSON Loading Code
- Move the inline JSON loading script (lines 315-332) to loadLocalJson.js
- Update loadLocalJson.js to include the file protocol check
- This maintains our single-responsibility principle for JavaScript files

### 3. Script Loading Order Fix
Update script order in sfiapdgen.html:
```html
<!-- jQuery must load first -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<!-- Bootstrap JS must load after jQuery -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- Application JS loads last -->
<script src="sfiapdgen_func.js"></script>
```

### 4. DOM Ready Event Handling
Update initialization code in init.js:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('localJsonFileInput');
    if (!fileInput) {
        console.error('File input element not found');
        return;
    }
    // Initialize file input handlers here
});
```

### 5. CORS Policy Fix
- Use the existing live-server setup for development:
```bash
npm run start-server
```
- Update JSON file paths to use relative URLs:
```javascript
// Change from absolute file paths
fetch('file:///sfia/json_source_v8.json')
// To relative paths
fetch('./json_source_v8.json')
```

### 6. Grunt Build Configuration
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
6. Resolves CORS and script loading issues
7. Improves error handling and initialization

## Implementation Steps
1. Remove duplicate theme toggle code from sfiapdgen.html
2. Move JSON loading code to loadLocalJson.js
3. Update script loading order in sfiapdgen.html
4. Add DOM ready event handlers in init.js
5. Update JSON fetch paths to use relative URLs
6. Run build process to verify changes
7. Start development server for testing
8. Test functionality in both development and production environments

## Testing Considerations
1. Test theme switching functionality
2. Verify local JSON loading works
3. Check build output for correct concatenation
4. Validate minified file works in production
5. Run existing test suite using Grunt tasks
6. Test Bootstrap collapse functionality
7. Verify file input operations
8. Test JSON loading with development server

## Future Considerations
1. Consider adding JSDoc comments to all JavaScript files
2. Document the build process in README.md
3. Consider implementing source maps for better debugging
4. Add unit tests for JavaScript functions
5. Implement proper error handling and user feedback
6. Consider adding a service worker for offline functionality
