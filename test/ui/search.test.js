Feature('Search Functionality');

Scenario('Verify search functionality', async ({ I }) => {
   // Open the page
   I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
   I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

  // Enter a search query
  const searchQuery = 'SUST';
  I.fillField('#myInput', searchQuery);

  // Wait for the search results to be updated
  I.waitForVisible('.sfia-table');

  // Verify that the search results contain the expected text
  within('.sfia-table', () => {
    I.see(searchQuery);

    // Assert that "BPTS" is not visible in the search results
    I.dontSee('BPTS');
  });
});
