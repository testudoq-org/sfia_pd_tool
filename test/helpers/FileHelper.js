const Helper = require('@codeceptjs/helper');
const fs = require('fs');
const path = require('path');

class FileHelper extends Helper {
  constructor(config) {
    super(config);
    // Get download directory from Playwright config or use default
    const playwrightConfig = this.helpers['Playwright'].config;
    this.downloadDir = playwrightConfig.downloads || path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads');
  }

  /**
   * Check if a CSV file matching the pattern exists in downloads
   * @param {number} timeout - Maximum time to wait for file in milliseconds
   * @returns {Promise<boolean>} - True if file exists, false otherwise
   */
  async checkDownloadedCSVFiles(timeout = 5000) {
    const startTime = Date.now();
    
    // Create downloads directory if it doesn't exist
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }

    this.debug(`Checking for CSV files in ${this.downloadDir}`);
    
    while (Date.now() - startTime < timeout) {
      try {
        const files = fs.readdirSync(this.downloadDir);
        const csvFiles = files.filter(file => file.startsWith('PositionSummary') && file.endsWith('.csv'));
        
        this.debug(`Found ${csvFiles.length} matching CSV files`);
        
        if (csvFiles.length > 0) {
          // Sort by modification time to get the most recent file
          const mostRecent = csvFiles
            .map(file => ({
              name: file,
              time: fs.statSync(path.join(this.downloadDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0];

          // Check if file was created recently
          if (Date.now() - mostRecent.time < 10000) {
            this.debug(`Found recent CSV file: ${mostRecent.name}`);
            return true;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        this.debug(`Error checking CSV files: ${error.message}`);
      }
    }
    
    throw new Error(`No matching CSV file found in ${this.downloadDir} within ${timeout}ms`);
  }

  /**
   * Verify that the downloaded CSV file contains the expected content
   * @param {string} expectedContent - Content to look for in the CSV file
   * @returns {Promise<boolean>} - True if content matches
   * @throws {Error} If file not found or content doesn't match
   */
  async seeCSVContent(expectedContent) {
    try {
      const files = fs.readdirSync(this.downloadDir);
      const csvFiles = files.filter(file => file.startsWith('PositionSummary') && file.endsWith('.csv'));
      
      if (csvFiles.length === 0) {
        throw new Error('No matching CSV file found');
      }

      // Get most recent CSV file
      const mostRecent = csvFiles
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(this.downloadDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)[0];

      const filePath = path.join(this.downloadDir, mostRecent.name);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      if (!fileContent.includes(expectedContent)) {
        throw new Error('The downloaded CSV file does not contain the expected content');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Error reading CSV file: ${error.message}`);
    }
  }
}

module.exports = FileHelper;
