# Application Initialization Error Investigation

## Problem

On page load in both dev and prod builds, the following notification appears:

```
Application initialization failed. Please refresh the page.
```

Console log shows:

```
Error during application initialization: TypeError: Cannot set properties of null (setting 'disabled')
    at Y (sfiapdgen-DFFyb1s3.js:1:1234)
    at X (sfiapdgen-DFFyb1s3.js:1:2160)
    at ve (sfiapdgen-DFFyb1s3.js:31:2118)
    at sfiapdgen-DFFyb1s3.js:31:2492
Uncaught TypeError: Cannot set properties of null (setting 'disabled')
    at Y (sfiapdgen-DFFyb1s3.js:1:1234)
    ...
```

## Root Cause

- The code attempts to set `.disabled` on a DOM element that does not exist at the time of execution.
- This is likely due to a missing or misordered stylesheet link (e.g., `styles-dark.css`) or a timing issue in the bundled JS.
- The error is caught by the main initialization try/catch and triggers the notification.

## Plan to Resolve

1. **Pinpoint the Failing Selector**
   - Review all code that sets `.disabled` on elements, especially theme-related stylesheets.
   - Ensure all `<link rel="stylesheet" ...>` elements exist in the HTML before JS runs.

2. **Harden Initialization**
   - Add null checks before setting `.disabled` on any element.
   - Ensure DOMContentLoaded is fully complete before running initialization logic.

3. **Align HTML and JS**
   - Confirm that the IDs and order of stylesheet links in the built HTML match what the JS expects (e.g., `id="theme-style"` and a second dark/light stylesheet).

4. **Test and Iterate**
   - After changes, rebuild and verify that the error and notification are resolved.

## Mermaid Diagram

```mermaid
flowchart TD
    A[Bundled JS Loads] --> B[Find stylesheet link elements]
    B --> C{Element found?}
    C -- No --> D[Skip or warn, do not set .disabled]
    C -- Yes --> E[Set .disabled property]
    E --> F[Continue initialization]
    D --> F
    F --> G{Error?}
    G -- Yes --> H[Show notification]
    G -- No --> I[App runs normally]