// FileHelper.js

const fs = require('fs');
const path = require('path');
const Helper = require('@codeceptjs/helper');

// Define global constant for download directory
const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads');

class FileHelper extends Helper {
    /**
     * Verify that the downloaded CSV file contains the expected content
     * @param {string} expectedContent
     * @throws {Error} Throws an error if the file does not exist or if the content does not match
     */
    async seeCSVContent(expectedContent) {
        const filePath = path.join(DOWNLOAD_DIR, 'PositionSummary.csv');
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            this.helpers['Assert'].assert.include(fileContent, expectedContent, 'The downloaded CSV file does not contain the expected content');
        } catch (error) {
            throw new Error(`Error reading CSV file: ${error.message}`);
        }
    }

    /**
     * Delete the downloaded CSV files
     * @throws {Error} Throws an error if there is an issue deleting the files
     */
    async deleteDownloadedCSVFiles() {
        try {
            const files = fs.readdirSync(DOWNLOAD_DIR);
            files
                .filter(file => file.endsWith('.csv'))
                .forEach(file => fs.unlinkSync(path.join(DOWNLOAD_DIR, file)));
        } catch (error) {
            throw new Error(`Error deleting CSV files: ${error.message}`);
        }
    }
}

// Export the FileHelper class
module.exports = FileHelper;
