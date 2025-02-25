const SearchPage = require('../pages/SearchPage');

Feature('Instructions Functionality');

Before(async ({ I }) => {
  this.searchPage = new SearchPage(I);
});

Scenario('Verify instructions are expanded by default and collapsible', async ({ I }) => {
  // Navigate to page
  await this.searchPage.navigateToSearch();

  // Verify initial visibility state (should be visible/expanded by default)
  const initialVisibility = await this.searchPage.getInstructionsVisibility();
  if (!initialVisibility) {
    throw new Error('Instructions should be expanded by default');
  }

  // Toggle instructions to hide
  await this.searchPage.toggleInstructions();
  
  // Verify collapsed state
  const collapsedVisibility = await this.searchPage.getInstructionsVisibility();
  if (collapsedVisibility) {
    throw new Error('Instructions should be collapsed after toggle');
  }

  // Toggle instructions to show again
  await this.searchPage.toggleInstructions();
  
  // Verify expanded state
  const finalVisibility = await this.searchPage.getInstructionsVisibility();
  if (!finalVisibility) {
    throw new Error('Instructions should be expanded after second toggle');
  }
}).retry(2); // Add retry for stability
