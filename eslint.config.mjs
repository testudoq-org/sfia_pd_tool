// ESLint flat config for the SFIA PD Generator
// Declares browser globals for all src/ modules to prevent no-undef false positives.

export default [
  {
    files: ['src/**/*.mjs', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MutationObserver: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        // CDN libraries (loaded via <script> tags)
        $: 'readonly',           // jQuery
        jQuery: 'readonly',      // jQuery
        ace: 'readonly',         // Ace Editor
        CryptoJS: 'readonly',   // CryptoJS
        bootstrap: 'readonly',  // Bootstrap JS
      },
    },
    rules: {
      // Allow unused vars with underscore prefix (common convention)
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      // Helpful warnings
      'no-console': 'off', // Console logging is intentional in this project
      'no-debugger': 'warn',
      'eqeqeq': ['warn', 'smart'],
      'prefer-const': 'warn',
    },
  },
  {
    // Test files config
    files: ['test/**/*.js', 'test/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // CodeceptJS globals
        Feature: 'readonly',
        Scenario: 'readonly',
        Before: 'readonly',
        After: 'readonly',
        // Browser globals for test setup
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        global: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'package/**',
      'coverage/**',
      'output/**',
      'src/vendor/**',
    ],
  },
];
