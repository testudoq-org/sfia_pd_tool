const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: './test/ui/*test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: 'http://127.0.0.1:5501/package/dev',
      show: true,
      browser: 'chromium',
      waitForTimeout: 10000
    }
  },
  include: {
    I: './steps/steps_file.js'
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    }
  },
  name: 'sfia'
};
