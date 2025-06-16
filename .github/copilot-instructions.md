# GitHub Copilot Instructions for the SFIA PD Generator Project

Welcome, Copilot! This guide will help you understand our project structure and how to best assist us.

## 1. Project Overview

This project is a SFIA (Skills Framework for the Information Age) Position Description Generator. It allows users to select SFIA skills and levels to generate a formatted position description.

Key technologies:
- Frontend: HTML, CSS, JavaScript (jQuery, Bootstrap)
- Build: Grunt, Webpack (via Grunt)
- E2E Testing: CodeceptJS with Playwright
- Unit Testing: (Planned) Jest

## 2. Directory Structure

Understanding our directory layout is crucial:

-   **`src/`**: Contains all the primary application source code.
    -   `sfiapdgen.html`: The main HTML file.
    -   `*.js`: Various JavaScript modules responsible for different functionalities (e.g., `dataFetching.js`, `tableRendering.js`, `checkboxHandling.js`).
    -   `sfiapdgen_func.js`: This is the concatenated JavaScript bundle created by Grunt for development (not directly edited).
    -   `*.css`: Stylesheets.
    -   `*.json`: SFIA data sources.
-   **`package/`**: Contains build outputs. **Do not edit files here directly.**
    -   `dev/`: Development build output (unminified, with sourcemaps).
        -   `sfiapdgen_func.js`: Concatenated JS for development.
    -   `prd/`: Production build output (minified, optimized).
        -   `sfiapdgen_func.min.js`: Minified JS for production.
-   **`test/`**: Contains all test files.
    -   `ui/`: End-to-end (E2E) tests written using CodeceptJS and Playwright.
        -   `*.test.js`: E2E test files.
        -   `page_objects/`: Page Object Models for E2E tests.
    -   `unit/`: (Planned) Unit tests will be located here and written using Jest.
-   **`memory-bank/`**: This is our core project documentation and knowledge base. It contains Markdown files detailing product context, technical decisions, system patterns, progress, etc. **Maintaining this documentation is very important.**
-   **`Gruntfile.js`**: Configures the Grunt build tasks (concatenation, minification, copying assets, running tests).
-   **`webpack.config.js`**: Webpack configuration, primarily used by Grunt for minification and asset handling in the production build.
-   **`package.json`**: Defines project dependencies and npm scripts (e.g., for running tests).
-   **`codecept.conf.js`**, `codecept.local.conf.js`, etc.: Configuration files for CodeceptJS E2E tests.

## 3. Copilot Guidelines

### Code Generation & Modification

-   **Application Logic**:
    -   New JavaScript functionality or modifications to existing logic should primarily be done within the appropriate files in the `src/` directory.
    -   Follow existing coding patterns and style. The project uses vanilla JavaScript with jQuery.
    -   Ensure new functions and significant changes are documented with JSDoc comments.
-   **E2E Tests**:
    -   When adding new features or modifying UI behavior, create or update E2E tests in `test/ui/`.
    -   Utilize Page Object Models (POMs) from `test/ui/page_objects/` where applicable.
    -   Write clear and descriptive test scenarios.
-   **Unit Tests (Future)**:
    -   When unit testing is implemented, new unit tests for JavaScript modules in `src/` should be placed in `test/unit/` and written using Jest.
-   **HTML/CSS**:
    -   Changes to the UI structure should be made in `src/sfiapdgen.html`.
    -   Style changes should be made in the relevant CSS files in `src/`.

### Documentation Maintenance (Crucial!)

-   **`memory-bank/` Updates**:
    -   If you assist in making changes to:
        -   Application logic or architecture
        -   Build processes
        -   Testing strategies or setup
        -   Key features or user workflows
    -   **You MUST prompt the user to consider updating the relevant Markdown files in the `memory-bank/` directory.**
    -   Key files to consider for updates include (paths relative to project root):
        -   [`../memory-bank/techContext.md`](../memory-bank/techContext.md): For technical implementation details, testing strategies.
        -   [`../memory-bank/systemPatterns.md`](../memory-bank/systemPatterns.md): For architectural patterns, build system details.
        -   [`../memory-bank/productContext.md`](../memory-bank/productContext.md): For feature changes, user impact.
        -   [`../memory-bank/progress.md`](../memory-bank/progress.md): For overall status changes.
-   **Alignment**: Ensure any AI-generated documentation or suggestions for documentation align with the established style, tone, and level of detail found in the existing `memory-bank/` files.
-   **READMEs** (paths relative to project root):
    -   [`../README.md`](../README.md): General project overview.
    -   [`../TEST-README.md`](../TEST-README.md): Detailed E2E testing guide.
    -   [`../contributions.md`](../contributions.md): Guide for setting up and contributing.
    -   If changes affect these, suggest updates.

### Build and Test Awareness

-   **Build Process**:
    -   The project is built using Grunt. Key tasks:
        -   `grunt build:dev`: Creates a development build in `package/dev/`.
        -   `grunt build:prd`: Creates a production build in `package/prd/`.
    -   Remember that `src/sfiapdgen_func.js` is a generated file; direct edits will be overwritten.
-   **Running E2E Tests**:
    -   Tests are run using CodeceptJS. Common commands (from `package.json` or Grunt):
        -   `npm run codeceptjs`
        -   `npm run codeceptjs:headless`
        -   `grunt testLocal` (runs CodeceptJS with local config, often pointing to `package/dev/`)
        -   `grunt testProduction` (runs CodeceptJS with prod config, often pointing to `package/prd/`)
-   **Running Unit Tests (Future)**:
    -   Once implemented, unit tests will likely be run via an npm script like `npm run test:unit`.

### General Advice

-   When suggesting code, try to match the existing style (vanilla JS, jQuery).
-   Be mindful of the different build outputs (`package/dev` vs. `package/prd`).
-   Always encourage testing for any new code or modifications.
-   If unsure about a specific convention, ask the user or refer to existing code/documentation.

Thank you for helping us build and maintain the SFIA PD Generator!
