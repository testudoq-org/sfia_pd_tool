Feature('Instructions Functionality');

Scenario('Verify instructions are collapsed by default and toggleable', async ({ I }) => {
    // Open the page
    I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html');
    I.seeInTitle('SFIA POSITION DESCRIPTION Generator');

    // Verify that the instructions start collapsed
    const initialState = await I.grabAttributeFrom('#instructions', 'class');
    if (!initialState.includes('collapsed')) {
        throw new Error('Instructions should be collapsed on load');
    }

    // Click the toggle button to expand
    I.click('button[data-bs-toggle="collapse"]');
    I.wait(2); // Wait for Bootstrap collapse animation
    
    // Verify expanded state
    I.seeElement('#instructions');
    
    // Click the toggle button to collapse
    I.click('button[data-bs-toggle="collapse"]');
    I.waitForInvisible('#instructions', 5); // Wait up to 5 seconds for collapse
});
