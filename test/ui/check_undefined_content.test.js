Feature('Check Undefined Content Issues');

Scenario('Verify SFIA content in output div', async ({ I }) => {
    // Access page directly with BPTS-2 hash
    I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html#BPTS-2');
    
    // Wait for SFIA output element to be present
    I.waitForElement('#sfia-output', 10);

    // Check text specifically within sfia-output element
    within('#sfia-output', () => {
        I.see('Acceptance testing - BPTS');
        I.dontSee('Acceptance testing - undefined');
    });
});

Scenario('Verify SFIA Page Refresh content in output div', async ({ I }) => {
    // Access page directly with BPTS-2 hash
    I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html#BPTS-2');

    I.refreshPage();
    
    // Wait for SFIA output element to be present
    I.waitForElement('#sfia-output', 10);

    // Check text specifically within sfia-output element
    within('#sfia-output', () => {
        I.see('Acceptance testing - BPTS');
        I.dontSee('Acceptance testing - undefined');
    });
});
