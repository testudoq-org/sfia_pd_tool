# Theme Audit & Refactor Plan for Reliable Theme Support

## 1. Context & Goals

- **Current State:**  
  - CSS uses both `light-dark()` and explicit `.light-theme`/`.dark-theme` selectors.
  - JS (`theme.mjs`) always sets `data-theme` on `<body>`, even in system mode.
  - Migration plan in [`themeManagement.md`](memory-bank/themeManagement.md:1) emphasizes additive, non-breaking changes.
- **Goal:**  
  - Centralize all theme logic using `light-dark()` and CSS variables.
  - In system mode, `<body>` must have no `.light-theme`, `.dark-theme`, or `data-theme`.
  - JS must not set theme classes/attributes in system mode.
  - All themeable styles must be consistent and auditable.

---

## 2. Step-by-Step Plan

### A. CSS Audit & Refactor

1. **Audit for Theme Selectors**
   - Identify all `.light-theme`, `.dark-theme`, and `[data-theme]` selectors in [`src/styles.css`](src/styles.css:1).
2. **Refactor to `light-dark()` or Variables**
   - Replace theme-dependent properties with `light-dark()` or CSS custom properties.
   - Remove or neutralize explicit theme class overrides where possible.
3. **System Mode Consistency**
   - Ensure all themeable elements use only `light-dark()` or variables, not hardcoded overrides.
   - Remove reliance on body classes/attributes for theme in system mode.

### B. JavaScript Audit & Refactor

1. **Audit Theme Logic**
   - Review [`src/modules/theme.mjs`](src/modules/theme.mjs:1) for logic that sets `.light-theme`, `.dark-theme`, or `data-theme`.
2. **Refactor System Mode Logic**
   - In system mode, ensure JS removes any theme classes/attributes from `<body>`.
   - Only set `data-theme` or classes for explicit light/dark modes.
3. **Centralize Theme Change Events**
   - Ensure all theme changes dispatch a single, consistent event.

### C. Testing & Validation

1. **Update/Expand Tests**
   - Ensure [`test/ui/themeManagement.test.js`](test/ui/themeManagement.test.js:1) and [`test/unit/theme.test.js`](test/unit/theme.test.js:1) cover:
     - No theme class/attribute in system mode.
     - Visual consistency between system (light) and explicit light mode.
     - No bypassing of centralized theme logic.
2. **Manual Audit**
   - Regularly search for selectors/scripts that bypass the system.

### D. Documentation & Communication

1. **Update Docs**
   - Document the new approach and audit process in [`themeManagement.md`](memory-bank/themeManagement.md:1).
2. **Summary Table**
   - Maintain a table of expected behavior for each mode.

---

## 3. Mermaid Diagram: Theme State Flow

```mermaid
flowchart TD
    A[User/System Chooses Theme] -->|Explicit Light| B[body: .light-theme or data-theme="light"]
    A -->|Explicit Dark| C[body: .dark-theme or data-theme="dark"]
    A -->|System| D[body: no theme class/attr]
    B & C --> E[CSS: light-dark() + overrides]
    D --> F[CSS: light-dark() only]
    E & F --> G[Consistent Visuals]
```

---

## 4. Summary Table

| Mode           | Body Class/Attr      | CSS Used                                   | Visual Result |
|----------------|---------------------|--------------------------------------------|---------------|
| System (light) | none                | `light-dark()`                             | Light         |
| Explicit Light | `.light-theme` or `data-theme="light"` | `light-dark()` + `.light-theme` overrides | Light         |
| Explicit Dark  | `.dark-theme` or `data-theme="dark"`  | `light-dark()` + `.dark-theme` overrides  | Dark          |

---

## 5. Open Questions

- Should legacy theme classes be fully removed, or just ignored in system mode?
- Is there a transition plan for third-party or legacy CSS that still uses theme classes?