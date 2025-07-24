// @ts-nocheck
const { I } = inject();

/**
 * Basic search functionality test
 * Validates that search input correctly filters table content
 */
Feature('Search');

Scenario('Filter table content using search input', ({ I }) => {
    I.amOnPage('/sfiapdgen.html');
    I.see('SFIA PD Generator', '.navbar-brand');
  
    const searchTerm = 'SUST';
    I.fillField('#myInput', searchTerm);

    // Wait for filtering to apply
    I.wait(2);

    // Check that only rows containing the search term are visible
    I.see(searchTerm, '.sfia-table');
    // Optionally, check that BPTS is not visible in any visible row
    I.dontSee('BPTS', '.sfia-table');
});
