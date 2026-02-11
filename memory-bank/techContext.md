# Technical Context and Implementation Details

## Update: February 2026 — SFIA Category Colours Toggle (Visual Fix)

### Overview
Branch: `feature-improve-table-and-skill-colors`

**Fixed SFIA category colours not rendering in the table despite correct CSS rules and body class. Added user-facing toggle.**

### Root Cause Analysis
Three CSS issues prevented colours from displaying:

1. **`!important` override** (primary blocker): Rule `body.light-theme #sfia-content tr { background: #fff !important; }` forced white backgrounds on ALL table rows in light mode, overriding everything.
   - **Fix:** Changed selector to `body.light-theme:not(.sfia-colours-on)` so it only applies when SFIA colours are off.

2. **Specificity mismatch**: The zebra-stripe override `body.sfia-colours-on .sfia-table tbody tr:nth-child(even)` (specificity 0,3,3) beat the category rules `body.sfia-colours-on .delivery_and_operation` (specificity 0,2,1). The `background: none` shorthand reset `background-color` to transparent.
   - **Fix:** Increased category selectors to `body.sfia-colours-on .sfia-table tbody tr.delivery_and_operation` (specificity 0,3,3), which wins by cascade order since it appears later.

3. **Shorthand vs longhand**: `background: none` (from zebra-stripe reset) implicitly sets `background-color: transparent`, overriding the explicit `background-color: var(--sfia-delivery)`.

### Settings Toggle Implementation
- **HTML:** Checkbox `#sfia-colours-toggle` in settings menu under "Display Options" heading.
- **JS (`windowEvents.mjs`):** Toggle handler adds/removes `body.sfia-colours-on`, persists to `localStorage('sfiaColoursEnabled')`.
- **JS (`theme-init.js`):** Blocking script restores `sfia-colours-on` class on page load before modules execute (FOUC prevention).

### CSS Architecture (NIWA-style)
```css
/* Category colour on <tr> */
body.sfia-colours-on .sfia-table tbody tr.delivery_and_operation {
  background-color: var(--sfia-delivery);
}
/* White overlays on <td> for graduated tints */
body.sfia-colours-on .sfia-table td.sub_key   { background: rgba(255,255,255,0.25); }
body.sfia-colours-on .sfia-table td.skill_key  { background: rgba(255,255,255,0.80); }
body.sfia-colours-on .sfia-table td.select_col { background: rgba(255,255,255,0.85); }
/* Dark mode: black overlays */
body.dark-theme.sfia-colours-on .sfia-table td.sub_key { background: rgba(0,0,0,0.35); }
```

---

## Update: February 11, 2026 — NIWA Colour Integration & E2E Fix

### Overview
Branch: `feature-improve-table-and-skill-colors`

**SFIA category colours aligned with NIWA reference site, overlay pattern adopted, and E2E clipboard test fixed.**

### CSS Category Colour System
- All 7 SFIA category classes now use CSS custom properties defined in `:root` (light) and `body.dark-theme` (dark).
- Colour values match the **NIWA reference site** at `https://niwa.github.io/sfia-position-description-tool`:
  | Category | Light | Dark | Variable |
  |---|---|---|---|
  | Strategy & Architecture | `rgb(216,48,80)` | `#a82038` | `--sfia-strategy` |
  | Change & Transformation | `rgb(188,81,141)` | `#8e3d6b` | `--sfia-change` |
  | Development & Implementation | `rgb(236,193,59)` | `#c4a030` | `--sfia-development` |
  | Delivery & Operation | `rgb(162,96,47)` | `#7a4d28` | `--sfia-delivery` |
  | People & Skills | `rgb(25,155,197)` | `#1a7fa8` | `--sfia-people` |
  | Relationships & Engagement | `rgb(0,153,79)` | `#00753c` | `--sfia-relationships` |
  | Skills & Quality | `rgb(0,155,205)` | `#007da8` | `--sfia-skills` |
- `.skills_and_quality` now correctly uses `--sfia-skills` (was incorrectly mapped to `--sfia-people`).
- Each category variable has a corresponding `--sfia-*-text` variable for accessible text contrast.

### NIWA Overlay Pattern
- NIWA uses **generic semi-transparent overlays** (not per-category subcategory colours) to lighten cells within a category row:
  - `td.sub_key`: `rgba(255,255,255,0.25)` — subcategory column
  - `td.skill_key`: `rgba(255,255,255,0.80)` — skill name column
  - `td.no_select_col`: `rgba(255,255,255,0.85)` — disabled checkbox column
- These are controlled via CSS custom properties (`--sfia-overlay-sub/skill/nosel`).
- In dark mode, overlays invert direction: `rgba(0,0,0,0.20/0.50/0.55)`.
- This replaced 7 broken per-category subcategory rules that referenced undefined `--sfia-strategy-sub`, `--sfia-change-sub`, etc.

### `copyToClipboard()` Resilience Fix
- **File:** [`windowEvents.mjs`](../src/modules/windowEvents.mjs)
- **Problem:** Function called `editor.getValue()` without null-checking. When the Ace editor wasn't yet initialized, it threw a TypeError before reaching the clipboard API, preventing any notification from being shown.
- **Fix:** Added try-catch wrapper and optional chaining: `(editor || window.editor)?.getValue?.()`. The function now always shows a notification (success or error) regardless of editor state.
- This fixes the E2E test `api_key_management.test.js` @skills scenario which expected `.notification.success` after copy.

---

## Update: February 2026 — Architectural Enhancements 4a–4d (PR #52)

### Overview
Branch: `main` (merged via PR #52 — 17 files changed, 1884 insertions, 288 deletions)

**Four architectural enhancements were implemented and merged:**

### 4a — Theme Consolidation
- Created [`theme-init.js`](../src/modules/theme-init.js) as an inline FOUC-prevention script that applies stored theme body classes before ES6 modules load.
- Consolidated all theme styles into a single [`styles.css`](../src/styles.css) using the CSS `light-dark()` colour function.
- Removed separate `styles-light.css` / `styles-dark.css` theme stylesheets.
- The `theme.mjs` module continues to manage the 3-way toggle cycle (light → system → dark → light).

### 4b — jQuery Removal
- Replaced **all** jQuery (`$`, `jQuery`) usage with vanilla JavaScript throughout the codebase.
- DOM queries use `document.querySelector` / `querySelectorAll`.
- Event binding uses `addEventListener`.
- DOM manipulation uses `classList`, `textContent`, `innerHTML`, `setAttribute`, etc.
- jQuery is no longer a runtime dependency.

### 4c — Virtual Scrolling
- Implemented [`virtualScroller.mjs`](../src/modules/virtualScroller.mjs) (405 lines) — a `VirtualScroller` class that renders only visible rows for the SFIA skill table (495 checkboxes, 121 skills).
- Integrated into:
  - [`initializeContent.mjs`](../src/modules/initializeContent.mjs) — table initialization uses virtual scroller
  - [`utilityFunctions.mjs`](../src/modules/utilityFunctions.mjs) — scroller access via `window._getSfiaScroller` (synchronous)
  - [`app.mjs`](../src/modules/app.mjs) — registers `window._getSfiaScroller` global
  - [`styles.css`](../src/styles.css) — virtual scroller container styling
- **Testing:** 27 unit tests in [`virtualScroller.test.js`](../test/unit/virtualScroller.test.js).

### 4d — Web Components
Three custom elements introduced in [`src/modules/components/`](../src/modules/components/):

1. **`<sfia-notification>`** ([`sfia-notification.mjs`](../src/modules/components/sfia-notification.mjs)):
   - **Light DOM** toast notification component with `.notification.{type}` CSS classes.
   - Includes `id="notification-container"` for backward compatibility with existing CSS and E2E tests.
   - `showNotification(message, type, duration)` method for programmatic use.
   - `windowEvents.mjs` delegates `showNotification` calls to this component.

2. **`<sfia-back-to-top>`** ([`sfia-back-to-top.mjs`](../src/modules/components/sfia-back-to-top.mjs)):
   - **Shadow DOM** scroll-to-top button with self-contained styles.
   - Appears after scrolling past threshold, smooth-scrolls to top on click.

3. **`<sfia-theme-toggle>`** ([`sfia-theme-toggle.mjs`](../src/modules/components/sfia-theme-toggle.mjs)):
   - **Shadow DOM** 3-way theme toggle button (light → system → dark → light).
   - Encapsulates theme toggle UI independently of main page styles.

- Modified [`sfiapdgen.html`](../src/sfiapdgen.html) — custom elements replace old HTML divs/buttons.
- Modified [`app.mjs`](../src/modules/app.mjs) — imports and registers all three components.
- **Testing:** 30 unit tests in [`webComponents.test.js`](../test/unit/webComponents.test.js).

### E2E Test Adaptations
After the 4d Web Component changes, 8 E2E tests initially failed and were fixed:
- **Theme toggle tests**: Updated to use `executeScript()` to pierce `<sfia-theme-toggle>` Shadow DOM.
- **Notification tests**: Work correctly with light DOM `<sfia-notification>` component (no shadow DOM piercing needed).
- **Search tests**: Fixed by switching `_getScroller()` in `utilityFunctions.mjs` to use `window._getSfiaScroller` synchronously instead of async dynamic import.

### Test Results (Post-Merge)
- **Unit tests:** 138 passed, 8 skipped, 0 failures (8 suites)
- **E2E tests:** 31 passed, 0 failures

---

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
