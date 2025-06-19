# Build System Modernization to Vite

This document outlines the migration of the project's build system from a Grunt-based workflow to Vite.

### 1. Dependencies
The primary dependency for the new build system is `vite`. All Grunt-related dependencies have been removed.

### 2. Vite Configuration
The build process is now managed by `vite.config.js`. This single configuration file handles development and production builds, including:
- Asset handling (HTML, CSS, JS, JSON)
- Minification
- Sourcemaps
- Development server

### 3. Build Scripts
The `package.json` scripts have been updated to use Vite:
- `npm run dev`: Starts the Vite development server.
- `npm run build:dev`: Creates a development build.
- `npm run build:prd`: Creates a production build.

### 4. Testing and Validation
Testing is now independent of the build process. Unit and end-to-end tests are run directly using Jest and CodeceptJS, respectively.
