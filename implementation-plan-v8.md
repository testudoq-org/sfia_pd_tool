# SFIA Version 8 Implementation Plan

## Overview
Configure SFIA version 8 as the default framework version when accessing the assessment web application while maintaining backwards compatibility with other SFIA versions. Also update protocol-specific UI elements for better security.

## Required Changes

### 1. HTML Changes (sfiapdgen.html)
Update version selection dropdown to show v8 as default:
```html
<div class="d-flex align-items-center gap-2">
    <label for="jsonVersionSelect">Select SFIA Version:</label>
    <select id="jsonVersionSelect" class="form-select">
        <option value="json_source_v9">version 9</option>
        <option value="json_source_v8" selected>version 8</option>
        <option value="json_source_v7">version 7</option>
    </select>
</div>
```

### 2. JavaScript Changes

#### init.js Updates
```javascript
function initializeVersionSelection() {
    const versionSelect = document.getElementById('jsonVersionSelect');
    if (!versionSelect) {
        console.error('Version selection dropdown not found');
        return;
    }

    // Show version selector for HTTP/HTTPS protocol
    if (window.location.protocol !== 'file:') {
        // Load saved version preference from cookie, default to v8 if none found
        const savedVersion = document.cookie
            .split('; ')
            .find(row => row.startsWith('selectedVersion='));
        
        if (savedVersion) {
            const version = savedVersion.split('=')[1];
            versionSelect.value = version;
        } else {
            // Set v8 as default if no cookie exists
            versionSelect.value = 'json_source_v8';
            document.cookie = 'selectedVersion=json_source_v8; path=/';
        }

        // Show version selector
        versionSelect.parentElement.style.display = 'flex';
    } else {
        // Hide version selector for file:/// protocol
        versionSelect.parentElement.style.display = 'none';
    }

    // Handle version changes
    versionSelect.addEventListener('change', async function() {
        const selectedVersion = this.value;
        
        try {
            // Save version preference
            document.cookie = `selectedVersion=${selectedVersion}; path=/`;
            
            // Reload content with new version
            await initializeContent();
            
            showNotification(`Successfully switched to SFIA ${selectedVersion}`, 'success');
        } catch (error) {
            console.error('Error switching versions:', error);
            showNotification('Error switching versions: ' + error.message, 'error');
        }
    });
}

// Update Local JSON button visibility based on protocol
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing application...');

    try {
        // Show instructions on page load
        $('#instructions').collapse('show');

        // Set up version selection handling
        initializeVersionSelection();

        // Handle Local JSON button visibility
        const loadBtn = document.getElementById('localJsonLoadBtn');
        if (loadBtn) {
            loadBtn.style.display = window.location.protocol === 'file:' ? 'inline-block' : 'none';
        }

        // Initialize content with appropriate data loading
        await initializeContent();

    } catch (error) {
        console.error('Error during application initialization:', error);
        showNotification('Error initializing application: ' + error.message, 'error');
    }
});
```

#### dataFetching.js Updates
```javascript
async function fetchSelectedVersionData(dropdownValue) {
    // Default to v8 if no version specified
    dropdownValue = dropdownValue || "json_source_v8";
    const jsonUrl = dropdownValue + ".json";
    const jsonData = await fetchData(jsonUrl);
    return jsonData;
}
```

## Implementation Steps

1. Update Version Selection UI
   - Modify version selector dropdown in sfiapdgen.html
   - Ensure v8 is marked as selected by default
   - Keep all version options available

2. Update JavaScript Files
   - Modify init.js to set v8 as default version
   - Update cookie handling to persist version preference
   - Update protocol-specific UI visibility logic
   - Ensure dataFetching.js defaults to v8

3. Build Process
   - No changes needed to Gruntfile.js
   - Run grunt build to concatenate updated files

## Testing Considerations

1. Version Selection
   - Verify SFIA v8 loads by default on first visit
   - Confirm version selection dropdown works correctly
   - Test version persistence across page reloads
   - Verify all SFIA versions remain accessible

2. Protocol-Specific Behavior
   - HTTP/HTTPS:
     * Version selector should be visible
     * Local JSON button should be hidden
   - file:/// Protocol:
     * Version selector should be hidden
     * Local JSON button should be visible

3. Error Handling
   - Test fallback to v8 if selected version fails to load
   - Verify proper error messages display
   - Check for null pointer exceptions
   - Ensure graceful fallback if files are missing

4. Backwards Compatibility
   - Test existing bookmarks still work
   - Verify existing saved data remains accessible
   - Confirm cookie-based version persistence works

## Notes
- Do not modify sfiapdgen_func.js directly as it is a grunt-built file
- Maintain all BOF/EOF comments in source files
- Ensure all error handling remains intact
- Test thoroughly in both development and production environments
- Document any breaking changes in release notes
