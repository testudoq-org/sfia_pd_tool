module.exports = {
  // Specify the test environment to use
  testEnvironment: 'jsdom',

  // Specify the pattern for matching test files
  testMatch: ['**/*.test.js'],

  // Specify the transformer for JavaScript files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Specify the file extensions to consider when looking for modules
  moduleFileExtensions: ['js', 'json', 'jsx'],

  // Specify the directory for storing code coverage reports
  coverageDirectory: 'coverage',

  // Enable code coverage collection
  collectCoverage: true,

  // Specify the reporters to use for generating code coverage reports
  coverageReporters: ['json', 'lcov', 'text', 'clover'],


  // Specify the test runner to use
  testRunner: 'jest-circus/runner',

  // Specify the timeout for each individual test
  testTimeout: 5000,

  // Specify the number of tests that can run concurrently
  maxConcurrency: 5,

  // Specify the root directory of your project
  rootDir: __dirname,

  // Specify the reporters to use for generating test results
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Results',
    }],
  ],

  // Specify the bail option to stop running tests after the first failure
  bail: true,

  // Specify the verbose option to display additional information during test runs
  verbose: true,

  // Specify the notify option to enable desktop notifications for test results
  notify: true,

  // Specify the notifyMode option to set the notification mode
  notifyMode: 'always',

  moduleNameMapper: {
    '^sfiapdgen_func$': '<rootDir>/sfiapdgen_func.js'
  }
};
