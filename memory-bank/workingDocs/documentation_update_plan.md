# Documentation Update and Copilot Instructions Plan

## Phase 1: Analyze Existing Markdown Documentation

1.  **Identify Target Markdown Files**:
    *   Files in the `memory-bank` directory:
        *   [`memory-bank/activeContext.md`](memory-bank/activeContext.md:1)
        *   [`memory-bank/productContext.md`](memory-bank/productContext.md:1)
        *   [`memory-bank/progress.md`](memory-bank/progress.md:1)
        *   [`memory-bank/systemPatterns.md`](memory-bank/systemPatterns.md:1)
        *   [`memory-bank/techContext.md`](memory-bank/techContext.md:1)
        *   [`memory-bank/ui-test-plan.md`](memory-bank/ui-test-plan.md:1)
    *   Files in the root directory:
        *   [`build-pipeline-analysis.md`](build-pipeline-analysis.md:1)
        *   [`build-pipeline-plan.md`](build-pipeline-plan.md:1)
        *   [`contributions.md`](contributions.md:1)
        *   [`debug-configuration-plan.md`](debug-configuration-plan.md:1)
        *   [`DEBUGGING.md`](DEBUGGING.md:1)
        *   [`ImproveDataFullyLoadedAndDefined.md`](ImproveDataFullyLoadedAndDefined.md:1)
        *   [`modernization-plan.md`](modernization-plan.md:1)
        *   [`pipeline-build-test.md`](pipeline-build-test.md:1)
        *   [`README.md`](README.md:1)
        *   [`TEST-README.md`](TEST-README.md:1)
2.  **Read and Assess Content**:
    *   Read each identified Markdown file.
    *   Identify sections related to:
        *   Application functionality and architecture.
        *   Build process (Grunt, Webpack, `package/dev`, `package/prod`).
        *   E2E testing procedures (CodeceptJS, Playwright, test scripts, test structure).
        *   Unit testing procedures (noting its current absence but planned use of Jest in `test/unit`).
    *   Note discrepancies, outdated information, or missing details.

## Phase 2: Update Markdown Documentation

1.  **Update E2E Testing Information**:
    *   Ensure documentation accurately reflects the setup in [`codecept.conf.js`](codecept.conf.js:1), scripts in [`package.json`](package.json:10), and practices outlined in [`TEST-README.md`](TEST-README.md:1) and [`pipeline-build-test.md`](pipeline-build-test.md:1).
    *   Clarify commands for running tests (e.g., `npm run codeceptjs`, `grunt testLocal`).
2.  **Update Unit Testing Information**:
    *   Add a section (or update existing ones) to state that unit tests are planned to be implemented using Jest and will reside in the `test/unit` directory.
3.  **Update Build Process Information**:
    *   Detail the Grunt tasks defined in [`Gruntfile.js`](Gruntfile.js:1) (e.g., `build:dev`, `build:prd`).
    *   Explain the role of Webpack (minification, etc.) as configured in [`webpack.config.js`](webpack.config.js:1) and invoked by Grunt.
    *   Describe the output structure (`package/dev` and `package/prod`).
4.  **Reflect Current Application State**:
    *   Ensure descriptions of application features and architecture align with the codebase (e.g., SFIA version selection, API key management, LoR handling, data rendering).
    *   Cross-reference with information from `src` files like [`src/sfiapdgen.html`](src/sfiapdgen.html:1), [`src/dataHandling.js`](src/dataHandling.js:1), etc.

## Phase 3: Create `.github/copilot-instructions.md`

1.  **Define Directory Structure**:
    *   Outline the key project directories:
        *   `src/`: Main application source code.
        *   `test/ui/`: E2E tests (CodeceptJS).
        *   `test/unit/`: (Planned) Unit tests (Jest).
        *   `package/dev/`: Development build output.
        *   `package/prd/`: Production build output.
        *   `memory-bank/`: Core project documentation and context.
        *   `docs/` (if applicable, or suggest creating it for generated user-facing documentation).
2.  **Instructions for Copilot**:
    *   **Code Generation**:
        *   Advise on placing new application logic within the [`src`](src:1) directory, following existing patterns.
        *   Guide on creating E2E tests in [`test/ui`](test/ui:1) using CodeceptJS and Playwright.
        *   Guide on creating unit tests in `test/unit` using Jest.
    *   **Documentation Maintenance**:
        *   Emphasize the importance of keeping the `memory-bank` documentation up-to-date.
        *   Instruct Copilot to update relevant files in `memory-bank/` when making changes to application logic, build processes, or testing strategies.
        *   Specify that AI-generated content should align with the style and level of detail in existing project documentation.
        *   Mention key files like [`memory-bank/techContext.md`](memory-bank/techContext.md:1) for technical details and [`memory-bank/systemPatterns.md`](memory-bank/systemPatterns.md:1) for architectural patterns.
    *   **Build and Test Awareness**:
        *   Remind Copilot about the Grunt build process (`grunt build:dev`, `grunt build:prd`).
        *   Remind Copilot about E2E test execution (`npm run codeceptjs` or Grunt tasks like `grunt testLocal`).
    *   **Commit Message Conventions** (Optional, if you have them).
    *   **Pull Request Guidelines** (Optional, if you have them).

## Visual Plan (Mermaid Diagram)

```mermaid
graph TD
    A[Start: Analyze Docs Request] --> B{Gather Info};
    B --> B1[Read package.json, webpack.config.js, codecept.conf.js];
    B --> B2[Read Gruntfile.js];
    B --> B3[Read src/sfiapdgen.html & key JS files];
    B --> B4[Read TEST-README.md, pipeline-build-test.md];
    B1 & B2 & B3 & B4 --> C[Understand App, Build & Test Processes];

    C --> D[Phase 1: Analyze Existing MD];
    D --> D1[Identify MD files in memory-bank & root];
    D1 --> D2[Read & Assess MD Content for relevance];

    C --> E[Phase 2: Update MD Docs];
    E --> E1[Update E2E Test Info];
    E --> E2[Add Unit Test Info (planned)];
    E --> E3[Update Build Process Info];
    E --> E4[Ensure MD reflects current app state];

    C --> F[Phase 3: Create .github/copilot-instructions.md];
    F --> F1[Define Directory Structure];
    F --> F2[Add Copilot Instructions: Code Gen];
    F --> F3[Add Copilot Instructions: Doc Maintenance (memory-bank)];
    F --> F4[Add Copilot Instructions: Build/Test Awareness];

    D2 & E1 & E2 & E3 & E4 & F1 & F2 & F3 & F4 --> G{Plan Complete};
    G --> H[User Review & Approval];
    H --> I[End Plan];
