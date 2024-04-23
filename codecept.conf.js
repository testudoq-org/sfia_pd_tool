const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

// Turn on headless mode when running with HEADLESS=true environment variable
setHeadlessWhen(process.env.HEADLESS);

// Enable all common plugins
setCommonPlugins();

/**
 * @type {CodeceptJS.MainConfig}
 */
exports.config = {
  tests: './test/ui/*.test.js',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'firefox',
      url: 'http://127.0.0.1:5500/src/sfiapdgen.html',
      // Use a more portable way to specify the path to Firefox executable
      // Make sure to use double backslashes in Windows paths
      executablePath: 'D:\\Program Files\\Mozilla Firefox\\firefox.exe',
      // Show browser window during tests (for debugging)
      show: true
    }
  },
  include: {
    I: './steps/steps_file.js'
  },
  name: 'sfia'
};
