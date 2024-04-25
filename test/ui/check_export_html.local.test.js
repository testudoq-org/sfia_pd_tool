Feature('Export to HTML Functionality');

Scenario('Verify export to HTML functionality', async ({ I }) => {
    // Open the page
    I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

    // Search for the skill "BPTS Level 2"
    const searchQuery = 'BPTS';
    I.fillField('#myInput', searchQuery);

    // Click on the skill "Acceptance testing" with level 2
    I.click("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]");


    // Click on the "Export to HTML" button
    await I.click('#exportHTML');

    //TODO
    // Verify that the download starts
   // I.seeInTitle('Download started');

    // Wait for the download to complete
   // await I.waitForDownload();

    // Verify that the downloaded file exists
  //  I.seeFileDownloaded('PositionSummary.html');

    // Verify the content of the downloaded file
  //  I.seeInFile('PositionSummary.html', 'Exported HTML content');
});
