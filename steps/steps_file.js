// in this file you can append custom step methods to 'I' object

// Register a global 'Before' hook to wait for SFIA data before each scenario
const { event, actor } = require('codeceptjs');

// Poll for event availability and register when ready
(function registerGlobalBeforeHook() {
  if (event && event.names && event.names.test && event.names.test.before) {
    event.dispatcher.on(event.names.test.before, async () => {
      const I = actor();
      try {
        await I.waitForElement('body[data-sfia-loaded="true"]', 20);
        console.log('[STEPS HOOK] SFIA data loaded before scenario (registered)');
      } catch (err) {
        console.warn('[STEPS HOOK] SFIA data did not appear before scenario (registered):', err && err.message ? err.message : err);
      }
    });
    console.log('[STEPS HOOK] Global before hook registered');
  } else {
    // Try again shortly
    setTimeout(registerGlobalBeforeHook, 100);
  }
})();

module.exports = function() {
  return actor({
    // Define custom steps here, use 'this' to access default methods of I.
    
    async checkDownloadedCSVFiles(timeout = 10000) {
      try {
        // First verify FileHelper is available
        if (!this.helpers['FileHelper']) {
          throw new Error('FileHelper is not configured in codecept.conf.js');
        }
        
        // Call the method with proper error handling
        console.log('Checking for downloaded CSV files...');
        const result = await this.helpers['FileHelper'].checkDownloadedCSVFiles(timeout);
        console.log('CSV file check completed');
        return result;
      } catch (error) {
        console.error('Error in checkDownloadedCSVFiles:', error);
        throw error;
      }
    },

    async seeCSVContent(expectedContent) {
      try {
        if (!this.helpers['FileHelper']) {
          throw new Error('FileHelper is not configured in codecept.conf.js');
        }
        
        console.log('Checking CSV content...');
        const result = await this.helpers['FileHelper'].seeCSVContent(expectedContent);
        console.log('CSV content check completed');
        return result;
      } catch (error) {
        console.error('Error in seeCSVContent:', error);
        throw error;
      }
    }
  });
}
