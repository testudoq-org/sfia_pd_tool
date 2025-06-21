# Theme Toggle via Body Class: Implementation & Testing Plan

## 1. Update CSS

- In [`src/styles.css`](../src/styles.css:1), add `.light-theme` and `.dark-theme` selectors for `<body>` if needed for explicit overrides.
- Ensure all themeable rules work with the default (system) and explicit classes.

## 2. Update HTML

- Ensure the toggle button exists:  
  [`<button id="theme-toggle-btn" ...><span id="theme-toggle-icon"></span></button>`](../src/sfiapdgen.html:30)

## 3. Implement Theme Toggle JS

- On button click, toggle `.dark-theme` and `.light-theme` classes on `<body>`.
- Remove both classes to revert to system default.
- Update the icon (`🌙` for dark, `🌞` for light, or system default).
- Update `aria-label` and `title` for accessibility.

## 4. Persist User Preference (Optional)

- Store the selected theme in `localStorage`.
- On page load, read and apply the stored theme.

## 5. Testing

- Verify toggling updates the theme visually.
- Check icon and accessibility attributes update correctly.
- Test persistence across reloads.
- Confirm fallback to system theme if no class is set.
- Validate with keyboard navigation and screen readers.

---

```mermaid
flowchart TD
    A[User clicks theme toggle button]
    B{Current theme?}
    C[Add .dark-theme to body]
    D[Add .light-theme to body]
    E[Remove theme classes for system default]
    F[Update icon and aria-label]
    G[Persist to localStorage]
    H[On load, apply stored theme]

    A --> B
    B -- System/Light --> C
    B -- Dark --> D
    C --> F
    D --> F
    F --> G
    G --> H
    H --> E