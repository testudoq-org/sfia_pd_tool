Feature('Export Functionality');

Scenario('Should export CSV file', async ({ I }) => {
    await I.amOnPage('http://127.0.0.1:5501/sfiapdgen.html');
    await I.see('SFIA PD Generator', '.navbar-brand');

    // Select a skill
    const checkboxXPath = '//input[@type="checkbox" and contains(@sfia-data, \'"skill":"Acceptance testing","level":2\')]';
    await I.waitForElement(checkboxXPath);
    await I.click(checkboxXPath);

    // Export CSV
    await I.waitForElement('#exportCSV');
    await I.click('#exportCSV');

    // Wait briefly for download to complete
    await I.wait(2);
});
