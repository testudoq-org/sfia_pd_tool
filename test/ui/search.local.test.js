Feature('Search Functionality');

Scenario('Verify basic search functionality @smoke', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5501/sfiapdgen.html');
  
  // Wait for table to load and be visible
  I.waitForVisible('.sfia-table tbody', 10);
  
  // Verify BPTS text is initially visible
  I.see('BPTS');
  
  // Search for SUST
  I.fillField('#myInput', 'SUST');
  
  // Allow search to take effect
  I.wait(2);
  
  // Verify search results
  I.see('SUST');
  I.dontSee('BPTS');
}).retry(2);
