const { setHeadlessWhen } = require('@codeceptjs/configure');

// Production tests always run in headless mode
setHeadlessWhen(true);

exports.config = {
  tests: './test/ui/*test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: 'https://testudo.co.nz/sfia',
      show: false,
      browser: 'chromium',
      waitForTimeout: 20000,
      waitForNavigation: 'networkidle0',
      trace: false,
      video: false,
      chromium: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }
  },
  include: {
    I: './steps/steps_file.js'
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    },
    retryFailedStep: {
      enabled: true,
      retries: 3
    },
    tryTo: {
      enabled: true
    }
  },
  multiple: {
    parallel: {
      chunks: 3,
      browsers: ['chromium', 'firefox']
    }
  },
  bootstrap: null,
  mocha: {
    reporterOptions: {
      reportDir: 'output'
    }
  },
  name: 'sfia-production'
};
