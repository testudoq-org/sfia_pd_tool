Feature('Export Functionality');

Scenario('Should export CSV file', async ({ I }) => {
    await I.amOnPage('/sfiapdgen.html');
    await I.see('SFIA PD Generator', '.navbar-brand');

    // Wait for SFIA data to be fully loaded before looking for checkboxes
    await I.waitForElement('body[data-sfia-loaded="true"]', 10);

    // Select a skill
    const checkboxXPath = '//input[@type="checkbox" and contains(@sfia-data, \'"skill":"Acceptance testing","level":2\')]';
    await I.waitForElement(checkboxXPath, 5);
    await I.click(checkboxXPath);

    // Export CSV
    await I.waitForElement('#exportCSV');
    await I.click('#exportCSV');

    // Wait briefly for download to complete
    await I.wait(2);
});
