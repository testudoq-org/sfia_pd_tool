const assert = require('assert');

Feature('Check the Export Functionality');

Scenario('Export CSV', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
  I.waitForElement('title', 10);
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator');

  // Select the checkbox for the skill
  I.waitForElement('//input[@type="checkbox" and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]', 10);
  I.click('//input[@type="checkbox" and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]');

  // Ensure the button is visible and clickable
  I.waitForElement('#exportCSV', 10);
  I.scrollTo('#exportCSV');
  I.click('#exportCSV');

  // Wait for the file to download
  I.wait(5);

  // TODO Verify that the downloaded file exists
 //I.seeFileInDownloads('PositionSummary.csv');

});
