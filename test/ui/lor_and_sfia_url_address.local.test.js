Feature('URL Test with checkbox');

Scenario('Check opening URL is correct', async ({ I }) => {
    // Navigate to a specific URL
    I.amOnPage('/sfiapdgen.html');

    // Grab and store the current URL
    const currentUrl = await I.grabCurrentUrl();

    // Print the current URL to the console
    console.log('Current URL:', currentUrl);

});

Scenario('Check opening URL is correct with chechbox added', async ({ I }) => {
    // Navigate to a specific URL
    I.amOnPage('/sfiapdgen.html');

    // Click on the checkbox with value "BPTS-2"
    I.click('#sfia-checkbox-BPTS-2');

    // Wait for the URL to change
    I.waitForURL();

    // Grab and store the current URL
    const currentUrl = await I.grabCurrentUrl();

    // Print the current URL to the console
    console.log('Current URL:', currentUrl);

    // Assert that the current URL contains the expected hash value
    const expectedUrl = '/sfiapdgen.html#BPTS-2';
    I.seeInCurrentUrl(expectedUrl);
});

Scenario('Check multiple skills are added to URL with correct format SFIA-1+SFIA-2', async ({ I }) => {
    // Navigate to a specific URL
    I.amOnPage('/sfiapdgen.html');

    // Click on the checkbox with value "BPTS-2"
    I.click('#sfia-checkbox-BPTS-2');

    // Click on the checkbox with value "BSMO-2"
    I.click('#sfia-checkbox-BSMO-2');

    // Wait for the URL to change
    I.waitForURL();

    // Grab and store the current URL
    const currentUrl = await I.grabCurrentUrl();

    // Print the current URL to the console
    console.log('Current URL:', currentUrl);

    // Assert that the current URL contains the expected hash value
    const expectedUrl = '/sfiapdgen.html#BPTS-2+BSMO-2';
    I.seeInCurrentUrl(expectedUrl);
});


Scenario('Check multiple skills are added to URL with correct format SFIA-1+LOR-2', async ({ I }) => {
    // Navigate to a specific URL
    I.amOnPage('/sfiapdgen.html');

    // Click on the checkbox with value "BPTS-2"
    I.click('#sfia-checkbox-BPTS-2');

    // Click on the checkbox with value "BSMO-2"
    I.click('#sfia-checkbox-BSMO-2');

    // Click on the checkbox with value "AUTO-1"
    I.click('#lor-checkbox-0-Autonomy-1');

    // Wait for the URL to change
    I.waitForURL();

    // Grab and store the current URL
    const currentUrl = await I.grabCurrentUrl();

    // Print the current URL to the console
    console.log('Current URL:', currentUrl);

    // Assert that the current URL contains the expected hash value
    const expectedUrl = '/sfiapdgen.html#BPTS-2+BSMO-2&&AUTO-1';
    I.seeInCurrentUrl(expectedUrl);
});
