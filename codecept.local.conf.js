// Import necessary functions from '@codeceptjs/configure'
const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

// Configure CodeceptJS to run in headless mode based on the HEADLESS environment variable
setHeadlessWhen(process.env.HEADLESS);

// Enable all common plugins for CodeceptJS
setCommonPlugins();

// Export the configuration object
exports.config = {
  // Other configuration options...

  // Define the location of your test files
  tests: './test/ui/*.local.test.js',

  // Define the output directory for test reports
  output: './output',

  // Configure helpers (e.g., Playwright, EndpointHelper, FileHelper)
  helpers: {
    // Define custom helper 'EndpointHelper' and specify its location
    EndpointHelper: {
      require: './test/helpers/EndpointHelper.js'
    },
    // Configure Playwright helper (e.g., browser, url, executablePath)
    Playwright: {
      browser: 'firefox', // Specify the browser to be used for testing
      url: 'http://127.0.0.1:5500/src/sfiapdgen.html', // Specify the base URL of your application
      executablePath: 'D:\\Program Files\\Mozilla Firefox\\firefox.exe', // Specify the path to the browser executable
      show: true // Show the browser window during tests (set to false for headless mode)
    },
    // Define custom helper 'FileHelper' and specify its location
    FileHelper: {
      require: './test/helpers/FileHelper.js'
    }
  },

  // Define custom steps file to include additional actions for tests
  include: {
    I: './steps/steps_file.js' // Specify the location of the steps file
  },

  // Define the name of your test suite
  name: 'sfia',

  // Configure reporters for generating test reports
  mocha: {
    reporterOptions: {
      reportDir: 'output', // Specify the output directory for test reports
      // Additional reporter options can be added here as needed
    }
  }
};
