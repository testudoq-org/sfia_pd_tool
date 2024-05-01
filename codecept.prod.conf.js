const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

// Turn on headless mode when running with HEADLESS=true environment variable
setHeadlessWhen(process.env.HEADLESS);

// Enable all common plugins
setCommonPlugins();

exports.config = {
  // Other configuration options...

  tests: './test/ui/*.prod.test.js',
  output: './output',
  helpers: {
    EndpointHelper: {
      require: './test/helpers/EndpointHelper.js'
    },
    Playwright: {
      browser: 'firefox',
      url: '(link unavailable)',
      executablePath: 'D:\\Program Files\\Mozilla Firefox\\firefox.exe',
      show: true
    }
  },
  include: {
    I: './steps/steps_file.js'
  },
  name: 'sfia'
};
