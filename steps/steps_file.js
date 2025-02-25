// in this file you can append custom step methods to 'I' object

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
