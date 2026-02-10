# Technical Context and Implementation Details

## Update: February 10, 2026

### UI Modernisation & Performance Review

Branch: `feature-modernise-and-improve-ui-and-performance-security-review`

**Performance Optimisations:**
- `content-visibility: auto` with `contain-intrinsic-size: auto 48px` on `.sfia-table tbody tr` — improves rendering performance for the 495-checkbox, 121-skill table.
- Search input debounced at 250ms via `debounce()` in [`utilityFunctions.mjs`](../src/modules/utilityFunctions.mjs). Core filtering logic extracted to `_searchForTextImmediate()` for synchronous unit testing.

**CSS Architecture:**
- CSS custom properties (design tokens) in `:root` for typography, spacing, border-radius, and transitions.
- Modern colour palette: `#2563eb`/`#60a5fa` primary, `#0d0d0d` dark background, `light-dark()` throughout.
- `:focus-visible` replaces `:focus` for modern focus ring behaviour.
- `.skip-to-content` and `.sr-only` accessibility utilities added.
- Theme toggle, checkbox hover, loading skeleton, and smooth version-switch transition styles added.

**Accessibility:**
- Skip-to-content link at top of page (visible on Tab focus).
- `aria-label` on nav, all LoR checkboxes, footer `role="contentinfo"`.
- `scope="col"` on all SFIA and LoR table `<th>` elements.
- Selection count badge with `aria-live="polite"` announces selections to screen readers.
- Escape key closes settings panel and returns focus to toggle button.
- `type="search"` and `role="search"` on search form.
- Removed `maximum-scale=1.0` from viewport meta.

**New UI Features:**
- Selection count badge (`#selection-count`) — shows "X skills, Y LoR" when selections are active.
- "Clear All" button (`#clearAllBtn`) — resets all SFIA and LoR checkbox selections.

**Phase 5 — Visual Polish (commit `d65541a`):**
- Row entrance animations (`@keyframes fadeSlideIn`) and selected-row highlight on checked rows.
- Badge pulse animation on selection count changes.
- Smooth version-switch fade transition in `jsonHandling.mjs`.
- Preconnect hints for CDN origins (jsdelivr, jquery, cloudflare).
- Custom scrollbar styling, AI button shine effect, search input glow on focus.
- Footer gradient border, enhanced `@media print` styles.

**Phase 6 — UI Polish & Theme Consolidation (commit `bacd0b5`):**
- **CSS cleanup:** Removed ~40 dead Tailwind-style utility classes (kept `.hidden`, `.mr-2`, `.mb-6`). Instructions chevron indicator (`::after`). Table row hover highlight. Empty-state `::before` styling for `#sfia-output`. Export button icon prefixes (`::before`). Notification icon prefixes (success ✓ / error ✗ / info ℹ). Mobile responsive block (`@media max-width: 768px`). Output div typography improvements.
- **HTML improvements:** Added `<meta name="description">`. Deferred Ace editor scripts (`defer` attribute). Dynamic copyright year (`<span id="copyright-year">`). `<span id="search-results-count">` below search input. `<button id="back-to-top">` after footer.
- **Theme consolidation (2c):** Rewrote [`theme.mjs`](../src/modules/theme.mjs) from scratch:
  - Unified on `theme-mode` localStorage key (previously inline script used `theme-mode`, module used `theme`).
  - 3-way toggle cycle: light → system → dark → light, matching the inline script's original behaviour.
  - Removed legacy stylesheet-swapping code (references to `styles-light.css`/`styles-dark.css` which no longer exist).
  - Data-driven `THEME_CONFIG` map reduces cyclomatic complexity.
  - Inline `<script>` reduced from 70 lines to 14-line FOUC-prevention snippet (applies body classes before modules load).
  - `initializeTheme()` now binds click/keydown listeners on `#theme-toggle-btn` (previously done by inline script).
- **JS features:**
  - **3a — Search results count:** `_searchForTextImmediate()` in `utilityFunctions.mjs` now updates `#search-results-count` with "Showing X of Y skills" during filtering.
  - **3b — Keyboard shortcuts:** `Ctrl+Shift+E` triggers `exportHTML()`, `Ctrl+K` focuses search input. Registered in `app.mjs` via `initializeKeyboardShortcuts()`. Ignored when user is typing in inputs/textareas.
  - **3c — Back-to-top button:** Shows after 400px scroll, smooth-scrolls to top on click. CSS transition with `.visible` class. Registered in `app.mjs` via `initializeBackToTop()`.
  - **2d — Dynamic copyright year:** Set via `initializeCopyrightYear()` in `app.mjs`.

**Code Quality:**
- Added [`eslint.config.mjs`](../eslint.config.mjs) (ESLint flat config) declaring browser globals (`window`, `document`, `console`), CDN library globals (`$`, `jQuery`, `ace`, `CryptoJS`), and test globals (`describe`, `Feature`, etc.). Resolves Codacy `no-undef` false positives.

---

## Update: June 21, 2025

### Theme Management and UI Testing

- The theme toggle system uses a **3-way cycle**: light (🌙) → system (🖥️) → dark (🌞) → light.
- Theme preference is stored under the `theme-mode` localStorage key.
- **FOUC prevention**: A minimal 14-line inline `<script>` applies the stored theme body classes before ES6 modules load.
- [`src/modules/theme.mjs`](../src/modules/theme.mjs) manages the toggle cycle, button binding, icon updates, and custom event dispatch (`themechange`, `theme-updated`).
- Theme applies body classes `light-theme`/`dark-theme` + `light-mode`/`dark-mode` and sets `data-theme` attribute.
- [`test/ui/themeManagement.test.js`](../test/ui/themeManagement.test.js) verifies:
  - Initial light mode state (`light-mode` class, `data-theme=light`, 🌙 icon).
  - 3-click cycle: light → system (`data-theme=system`, 🖥️) → dark (`dark-mode`, `data-theme=dark`, 🌞) → light.
  - All theme management UI tests pass after the consolidation.

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
