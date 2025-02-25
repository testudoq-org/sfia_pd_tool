Feature('Select Json Version');

Scenario('Check that the Select Json version operates correctly for version 8', async ({ I }) => {
    // Open the page
    I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator');

    // Check version 8 selection
    I.selectOption('#jsonVersionSelect', 'version 8');
    
    // Verify dropdown selection using seeInField
    I.seeInField('#jsonVersionSelect', 'version 8');
    
    // Additional verification that the option exists and is visible
    I.see('version 8', '#jsonVersionSelect');

    // Check if cookie is set correctly
    I.seeCookie('selectedVersion', 'json_source_v8');
});

Scenario('Check that the Select Json version operates correctly for version 7', async ({ I }) => {
    // Open the page  
    I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator');

    // Check version 7 selection
    I.selectOption('#jsonVersionSelect', 'version 7');
    
    // Verify dropdown selection using seeInField
    I.seeInField('#jsonVersionSelect', 'version 7');
    
    // Additional verification that the option exists and is visible
    I.see('version 7', '#jsonVersionSelect');

    // Check if cookie is set correctly
    I.seeCookie('selectedVersion', 'json_source_v7');
});
