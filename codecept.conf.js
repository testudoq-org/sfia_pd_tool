const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

// Turn on headless mode when running with HEADLESS=true environment variable
setHeadlessWhen(process.env.HEADLESS);

// Enable all common plugins
setCommonPlugins();

// Import the EndpointHelper helper
//const { EndpointHelper } = require('./helpers/EndpointHelper.js');

exports.config = {
  // Other configuration options...

  tests: './test/ui/*.test.js',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'firefox',
      url: 'http://127.0.0.1:5500/src/sfiapdgen.html',
      executablePath: 'D:\\Program Files\\Mozilla Firefox\\firefox.exe',
      show: true
    }
  },
  include: {
    I: './steps/steps_file.js'
  },
  name: 'sfia'
};
