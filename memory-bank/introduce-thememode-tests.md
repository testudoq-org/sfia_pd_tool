# Incremental Plan for Theme Mode UI Test

## 1. Establish Baseline Test Structure
- Create `test/ui/themeManagement.test.js` with `Feature('Theme Management')` and a basic `Scenario`.

## 2. Stepwise Test Implementation

### Step 1: Verify Theme Toggle Button Presence
- Open `/sfiapdgen.html`.
- Assert the presence and visibility of the theme toggle button (`#theme-toggle-btn`).

### Step 2: Assert Initial Theme State
- Check for the expected default theme:
  - CSS class on `<body>` (e.g., `light-mode` or `dark-mode`).
  - Data attribute on `<body>` (e.g., `data-theme="light"`).
  - Icon/text in `#theme-toggle-icon` (e.g., 🌙 for dark mode, ☀️ for light mode).

### Step 3: Switch to Dark Mode
- Click the theme toggle button.
- Assert:
  - CSS class and data attribute update to dark mode.
  - Icon/text changes accordingly.

### Step 4: Switch Back to Light Mode
- Click the theme toggle button again.
- Assert:
  - CSS class and data attribute revert to light mode.
  - Icon/text reverts.

### Step 5: Accessibility and Attribute Checks (Optional)
- Verify `aria-label` and `title` attributes update appropriately.

## 3. Document Each Increment
- For each step, document the rationale and expected outcome in this file.

---

## Mermaid Diagram

```mermaid
flowchart TD
    A[Open /sfiapdgen.html] --> B{Theme toggle visible?}
    B -- Yes --> C[Check initial theme (class, data, icon)]
    C --> D[Click toggle]
    D --> E[Check dark mode (class, data, icon)]
    E --> F[Click toggle again]
    F --> G[Check light mode (class, data, icon)]
    G --> H[Check accessibility attributes]