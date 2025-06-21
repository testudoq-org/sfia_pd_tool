# Incremental Migration Plan: Theme Management System

This plan outlines a safe, iterative migration to the new theme management system, with orchestration, test strategy, and risk notes for each step.

---

## Step 1: Preparation and Baseline Validation

- **Actions:**
  - Review [`src/styles.css`](src/styles.css:1), [`src/styles-light.css`](src/styles-light.css:1), [`src/styles-dark.css`](src/styles-dark.css:1) for current selectors and structure.
  - Confirm no changes to existing selectors/IDs.
  - Run the full codeceptjs e2e suite to establish a baseline.
- **Tests:** Run all e2e tests; results must be green before proceeding.
- **Risks/Dependencies:** None; this is a read-only and validation step.

---

## Step 2: Introduce CSS Variables and Theme Classes

- **Actions:**
  - Add CSS custom properties (variables) for themeable values in [`src/styles.css`](src/styles.css:1).
  - Define new theme classes or data attributes (e.g., `.theme-dark`, `data-theme="dark"`).
  - Do not remove or rename any existing CSS rules/selectors.
- **Tests:**
  - Run all e2e tests after changes.
  - Add/extend unit tests for CSS variable presence if feasible.
- **Risks/Dependencies:** Low; changes are additive. If variables are not referenced yet, no visual impact.

---

## Step 3: Integrate Theme Toggle (UI & Logic)

- **Actions:**
  - Implement the theme toggle button in a relevant HTML file (e.g., [`src/sfiapdgen.html`](src/sfiapdgen.html:1)).
  - Add logic in [`src/modules/theme.mjs`](src/modules/theme.mjs:1) to toggle theme classes/data attributes.
  - Ensure toggle is accessible (ARIA, keyboard).
- **Tests:**
  - Run all e2e tests.
  - Add new e2e test: user can toggle theme and see class/data attribute change.
  - Add/extend unit tests for themeManager API.
- **Risks/Dependencies:** Moderate; toggle must not interfere with existing UI. Test for regressions.

---

## Step 4: Event Handling and App Integration

- **Actions:**
  - Add event listeners/custom events for theme changes in [`src/modules/theme.mjs`](src/modules/theme.mjs:1).
  - Ensure components listen for and respond to theme changes.
- **Tests:**
  - Run all e2e tests.
  - Add/extend e2e test: theme change propagates to all relevant components.
- **Risks/Dependencies:** Moderate; ensure legacy event handling is not affected.

---

## Step 5: Additive Testing and Validation

- **Actions:**
  - Review all test files referencing theme logic (`test/ui/`, `test/unit/`).
  - Add new tests for theme toggle, persistence, and event dispatch.
  - Do not remove or alter existing tests.
- **Tests:**
  - Run all e2e and unit tests.
  - Ensure new tests cover theme logic and backward compatibility.
- **Risks/Dependencies:** Low; only additive changes.

---

## Step 6: Accessibility & Performance Validation, Documentation

- **Actions:**
  - Run accessibility tools (axe-core, Lighthouse) and performance profiling.
  - Update [`memory-bank/themeManagement.md`](memory-bank/themeManagement.md:1) and any developer docs.
- **Tests:**
  - Run all e2e tests.
  - Document results of accessibility/performance checks.
- **Risks/Dependencies:** Low; validation and documentation only.

---

## Orchestration Guidance

- After each step, run the full codeceptjs e2e suite and evaluate results.
- Only proceed to the next step if all tests pass.
- Add or update tests as described above to maintain/improve coverage.
- Document any issues or regressions before moving forward.

---

## Mermaid Diagram: Incremental Workflow

```mermaid
flowchart TD
    A[Step 1: Preparation & Baseline] --> B[Step 2: CSS Variables & Classes]
    B --> C[Step 3: Theme Toggle Integration]
    C --> D[Step 4: Event Handling & Integration]
    D --> E[Step 5: Additive Testing]
    E --> F[Step 6: Accessibility/Performance & Docs]
    subgraph After Each Step
      X[Run codeceptjs e2e tests]
      Y[Add/Update Tests]
    end
    A -.-> X
    B -.-> X
    C -.-> X
    D -.-> X
    E -.-> X
    F -.-> X
    A -.-> Y
    B -.-> Y
    C -.-> Y
    D -.-> Y
    E -.-> Y
    F -.-> Y