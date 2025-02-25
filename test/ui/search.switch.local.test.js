// @ts-nocheck
const { I } = inject();

/**
 * Basic search functionality test
 * Validates that search input correctly filters table content
 */
Feature('Search');

Scenario('Filter table content using search input', ({ I }) => {
    I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html');
    I.see('SFIA PD Generator', '.navbar-brand');
  
  const searchTerm = 'SUST';
  I.fillField('#myInput', searchTerm);
  
  within('.sfia-table', () => {
    I.see(searchTerm);    // Matching content visible
    I.dontSee('BPTS');   // Non-matching content hidden
  });
});
