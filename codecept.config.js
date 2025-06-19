const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: './test/ui/*.test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: 'http://localhost:5502/src',
      show: true,
      browser: 'chromium'
    }
  },
  include: {},
  name: 'sfia',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true
    },
    tryTo: {
      enabled: true
    },
    screenshotOnFail: {
      enabled: true
    }
  }
};
