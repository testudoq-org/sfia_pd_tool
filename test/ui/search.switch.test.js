const path = require('path');
const EndpointHelper = require(path.join(__dirname, '..', 'helpers', 'EndpointHelper.js'));
Feature('Search Switch Functionality');
Scenario('Verify search functionality', async ({ I, EndpointHelper }) => {
   // Navigate to the local endpoint
   await I.EndpointHelper.navigateToEndpoint('local');

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
