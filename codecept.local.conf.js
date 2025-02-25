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
      waitForTimeout: 30000, // Increased timeout for element waits
      trace: true,
      video: true,
      windowSize: '1280x720', // Match CI environment
      chromium: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      timeout: 30000, // Global timeout
      navigation: 'networkidle' // Modern navigation strategy
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
      retries: 2
    },
    tryTo: {
      enabled: true
    }
  },
  bootstrap: null,
  mocha: {
    reporterOptions: {
      reportDir: 'output'
    }
  },
  name: 'sfia-local'
};
