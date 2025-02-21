# Theme Toggle Refactoring Plan

## Current State
- Theme toggle functionality exists in two places:
  1. In `src/theme.js` as a module
  2. Inline in `sfiapdgen.html` as a script tag
- The code is nearly identical in both locations
- `theme.js` is already part of the Grunt concatenation process that creates `sfiapdgen_func.js`

## Issues
1. Duplicate code creates maintenance overhead
2. Inline script blocks reduce code maintainability
3. Theme logic should be encapsulated in a dedicated module

## Solution

### 1. Verify Theme Module Integration
- Theme.js is already properly included in Grunt's concat task
- It's concatenated with other modules into `sfiapdgen_func.js`
- No changes needed to Gruntfile.js configuration

### 2. Remove Duplicate Code
Delete the following code block from `sfiapdgen.html`:
```html
<!-- Add Theme Toggle Script -->
<script>
function toggleTheme() {
    const lightTheme = document.querySelector('link[href="styles-light.css"]');
    const darkTheme = document.querySelector('link[href="styles-dark.css"]');
    const isLight = !document.getElementById('theme-switch').checked;
    
    lightTheme.disabled = !isLight;
    darkTheme.disabled = isLight;
    
    // Save preference
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.getElementById('theme-switch').checked = savedTheme === 'dark';
    toggleTheme();
});
</script>
```

### 3. Update HTML Reference
The theme toggle checkbox in `sfiapdgen.html` already references the `toggleTheme()` function which will be available through `sfiapdgen_func.js`. No changes needed to the HTML structure:
```html
<input type="checkbox" id="theme-switch" onchange="toggleTheme()">
```

## Implementation Steps
1. Run `grunt build:src` to ensure theme.js is properly concatenated
2. Remove the duplicate script block from sfiapdgen.html
3. Test theme toggle functionality:
   - Verify theme switches between light/dark
   - Confirm preference is saved to localStorage
   - Validate theme loads correctly on page refresh

## Benefits
1. Improved maintainability through module organization
2. Reduced code duplication
3. Better separation of concerns
4. Consistent with project's module structure

## Risks and Mitigations
- Risk: Theme toggle might break if module loading fails
  * Mitigation: Already part of core functionality concat process
  * Theme.js is early in the concat order (good for initialization)

## Testing Plan
1. Manual Testing:
   - Toggle theme between light/dark
   - Refresh page to verify saved preference
   - Test in different browsers
2. Automated Testing:
   - Consider adding theme toggle tests to existing test suite

## Fallback Plan
If issues arise, the inline script can be temporarily restored while debugging the module integration.
