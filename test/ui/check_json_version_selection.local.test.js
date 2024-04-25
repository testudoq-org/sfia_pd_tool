Feature('Select Json Version');

Scenario('Check that the Select Json version operates correctly for version 8', async ({ I }) => {
    // Open the page
    I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

    // Check if version 8 option is selected
    I.selectOption('#jsonVersionSelect','version 8');
    I.seeElement('#jsonVersionSelect','version 8');

    // Check if version 7 option is not selected

    I.dontSee('version 7');

    // Check if cookie is set
    I.seeCookie('selectedVersion', 'json_source_v8');
});


Scenario('Check that the Select Json version operates correctly for version 7', async ({ I }) => {
    // Open the page
    I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

    // Check if version 8 option is selected
    I.selectOption('#jsonVersionSelect','version 7');
    I.seeElement('#jsonVersionSelect','version 7');

    // Check if version 8 option is not selected

    I.dontSee('version 8');

    // Check if cookie is set
    I.seeCookie('selectedVersion', 'json_source_v7');
});
