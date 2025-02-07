Feature('Instructions Functionality');

Scenario('Verify instructions are expanded on load and collapsible', async ({ I }) => {
    // Open the page
    I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Assert the title

    // Verify that the instructions are visible on load
    I.seeElement('#instructions'); // Check if the instructions element is present

    // Verify that the instructions are expanded
    const isExpanded = await I.grabAttributeFrom('#instructions', 'class');
    // Use an assertion method that works in CodeceptJS
    if (isExpanded.includes('collapse')) {
        throw new Error('Instructions should be expanded on load');
    }

    // Click the toggle button to collapse the instructions
    I.click('button[data-toggle="collapse"]');

    // Verify that the instructions are collapsed
    I.dontSeeElement('#instructions'); // Check that the instructions are not visible

    // Click the toggle button again to expand the instructions
    I.click('button[data-toggle="collapse"]');

    // Verify that the instructions are visible again
    I.seeElement('#instructions'); // Check that the instructions are visible again
});
