# SFIA Test Automation Guide

## Overview
This document outlines the test automation framework and processes for the SFIA Position Description Generator tool.

## 🛠 Technology Stack
- **Test Framework**: CodeceptJS
- **Browser Automation**: Playwright
- **Browser**: Chromium
- **Test Types**:
  - UI/E2E Tests (CodeceptJS with Playwright)
  - Unit Tests (Planned - Jest, to be located in `test/unit/`)

## 📁 Test Structure
```
test/
├── __mocks__/           # Mock data
├── config/              # Test configurations
├── data/               
│   ├── exports/        # Export test data
│   └── skillsets/      # SFIA skill definitions
├── helpers/            # Test helper functions
├── pages/              # Page Object Models
└── ui/                 # UI Test Suites (CodeceptJS)
├── unit/               # Unit Test Suites (Planned - Jest)
```

## 🚀 Running Tests

### Prerequisites
1. Node.js installed
2. Project dependencies installed:
```bash
npm install
```
3. Environment setup:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
# TEST_API_KEY - Required for API key management tests
```
4. Local development server running:
```bash
npm run start-server
```

### Test Commands

```bash
# Run all UI tests
npm run codeceptjs

# Run tests in headless mode
npm run codeceptjs:headless

# Run specific test file
npx codeceptjs run ./test/ui/[test-file].js --steps

# Run export tests
npm run test:export

# Open CodeceptJS UI
npm run codeceptjs:ui
```

#### UI/E2E Test Automation with Vite

You can run UI/E2E tests in two ways:

**1. Self-contained (Vite managed by script):**
```bash
# Starts Vite on port 5502, waits for it to be ready, then runs tests
npm run test:local

# Starts Vite on port 5503, waits for it to be ready, then runs tests
npm run test:dev
```
These scripts will kill any process on the required port before starting.

**2. Against an already-running Vite server:**
```bash
# If you have already started Vite manually (e.g., npm run dev:local), use:
npm run test:local:external

# Or for dev mode:
npm run test:dev:external
```
These scripts will wait for the server to be available and then run tests, without starting or stopping Vite.

**Best Practice:**
Use the `:external` scripts when debugging or developing with Vite running in a separate terminal. Use the standard scripts for automated or CI runs.

**Note:**
Ensure only one Vite instance is running per port to avoid conflicts.

## 🔧 Test Configuration

### Local Environment (codecept.local.conf.js)
- Base URL: http://127.0.0.1:5501/package/dev
- Browser: Chromium
- Window Size: 1280x720
- Default Timeout: 30 seconds
- Video Recording: Enabled
- Screenshots on Failure: Enabled

### Key Features
- Automatic retry on failed steps (2 retries)
- Video recording of test runs
- Screenshots on test failures
- Network idle wait strategy for better stability

## 📑 Test Suites

### UI Tests
Located in `/test/ui/`:
- Search functionality (`search.local.test.js`)
- Skills verification (`check_skills.local.test.js`)
- Export functionality
  - CSV export (`check_export_csv.local.test.js`)
  - HTML export (`check_export_html.local.test.js`)
- System setup verification (`verify_setup.test.js`)
- And more...

## 📊 Test Results
- Screenshots: `output/` directory
- Video recordings: `output/` directory
- Test reports: `output/` directory

## 🔍 Debug Support
- Screenshots captured automatically on test failures
- Video recordings available for test runs
- Extended logging with `--steps` flag
- Visual debugging with CodeceptJS UI

## 💡 Best Practices
1. Use Page Objects from `test/pages/` for UI interactions
2. Utilize helper functions from `test/helpers/` for common operations
3. Keep test data in `test/data/` directory
4. Add appropriate waiting strategies using `WaitHelper`
5. Run tests in headless mode for CI/CD pipelines

## ⚠️ Known Limitations
1. Tests require a running local server (port 5501)
2. Some tests may be sensitive to network conditions
3. Headless mode might behave differently than headed mode

## 🔄 CI/CD Integration
Tests can be integrated into CI/CD pipelines using the headless mode:
```bash
HEADLESS=true npm run codeceptjs
```

## 📚 Resources
- [CodeceptJS Documentation](https://codecept.io/)
- [Playwright Documentation](https://playwright.dev/)
