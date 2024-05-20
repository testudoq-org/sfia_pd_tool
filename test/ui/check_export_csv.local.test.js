Feature('Check the Export Functionality');

Scenario('Export CSV', async ({ I }) => {
    // Delete all downloaded CSV files
    await I.deleteDownloadedCSVFiles();

    // Open the page
    I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
    I.waitForElement('title', 5);
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator');

    // Select the checkbox for the skill
    I.waitForElement('//input[@type="checkbox" and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]', 5);
    I.click('//input[@type="checkbox" and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]');

    // Ensure the button is visible and clickable
    I.waitForElement('#exportCSV', 5);
    I.scrollTo('#exportCSV');
    I.wait(2);  // Give some time for UI to be ready

    // Check the visibility and enable state of the button
    I.seeElement('#exportCSV');
    I.waitForEnabled('#exportCSV', 5);

    // Move cursor to the button
    I.moveCursorTo('#exportCSV');
    I.wait(1);  // Small wait to ensure cursor movement

    // Trigger the click event
    // Double click the button
    I.doubleClick('#exportCSV');

    // Add debugging statements
    I.say('Attempting double click on the export CSV button');


    I.executeScript(() => {
        const exportCSVButton = document.querySelector('#exportCSV');
        if (exportCSVButton) {
            exportCSVButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    });


    // TODO Verify the content of the downloaded CSV file - issue headerless not downloading CSV
   // await I.seeCSVContent('Expected content in the CSV file');
});
