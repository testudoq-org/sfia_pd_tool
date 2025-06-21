# Technical Context and Implementation Details

## Update: June 21, 2025

### Theme Management and UI Testing

- The theme toggle system now uses "🌞" as the light mode icon and "🌙" for dark mode, standardized across both implementation and UI tests.
- [`src/modules/theme.mjs`](../src/modules/theme.mjs) manages theme switching, icon updates, and accessibility attributes.
- [`test/ui/themeManagement.test.js`](../test/ui/themeManagement.test.js) verifies:
  - Presence and visibility of the theme toggle button and icon.
  - Initial theme state (CSS class, data attribute, icon).
  - Switching between light and dark modes, including icon and attribute changes.
  - Accessibility attributes (`aria-label`, `title`) update correctly.
- All theme management UI tests now pass after aligning the icon usage.

---

## JSON Data Loading Improvements (2025-06)

### Simplified JSON Fetching for All Environments

**Background:**  
Previously, the application used complex logic to construct JSON URLs for SFIA and LOR data, checking `hostname` and `pathname` to determine the correct path for local, dev, or production environments.

**Improvement:**  
With the Vite build and dev server now serving `/src` as the web root for local development, and copying JSON files to the output root for dev/prod builds, all environments can now fetch JSON files using a simple relative path.

**Implementation:**
- In [`src/modules/jsonHandling.mjs`](../src/modules/jsonHandling.mjs), the JSON version switcher now always fetches using:
  ```javascript
  const jsonUrl = `${selectedVersion}.json`;
  fetch(jsonUrl)
  ```
- In [`src/modules/initializeContent.mjs`](../src/modules/initializeContent.mjs), the LOR data loader now always fetches using:
  ```javascript
  const lorJsonUrl = 'json-sfia-lors-v8.json';
  fetch(lorJsonUrl)
  ```
- All hostname/pathname checks have been removed.

**Result:**
- The code is simpler and more robust.
- No environment-specific logic is needed for JSON file loading.
- This matches the Vite config, which ensures JSON files are always available at the root of the served directory (local, dev, or prod).
- This approach is compatible with both ES6 modules and legacy JS.

**Testing:**  
- Confirmed working in all environments:  
  - Local dev (`npm run start-server:local`)
  - Dev build (`npm run build:dev`)
  - Production build (`npm run build:prd`)

**Action:**  
If you update the Vite asset handling or move JSON files, ensure this convention is maintained.

---

## (Remaining content unchanged; see previous version for full details)
