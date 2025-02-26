const BasePage = require('./BasePage');

class SearchPage extends BasePage {
  constructor(I) {
    super(I);
    this.selectors = {
      ...this.selectors,
      searchInput: '#myInput',
      searchResults: '.sfia-table',
      resultRows: '.sfia-table tbody tr',
      skillCell: 'td:first-child',
      instructions: '#instructions',
      instructionsToggle: '#instructionsToggle'
    };
  }

  async navigateToSearch() {
    await this.I.amOnPage('/sfiapdgen.html');
    // Use waitForLoadState to ensure page is fully loaded
    await this.I.page.waitForLoadState('networkidle');
    // Use locator API for better auto-waiting
    await this.I.locator(this.selectors.searchInput).waitFor();
    await this.I.locator(this.selectors.searchResults).waitFor();
    await expect(this.I.page).toHaveTitle(/SFIA POSITION DESCRIPTION Generator/);
  }

  // Removed searchFor and waitForSearchResults methods since we handle search directly in the test

  async getSearchResults() {
    await this.waitForSearchResults();
    return await this.I.grabTextFromAll(`${this.selectors.searchResults} ${this.selectors.skillCell}`);
  }

  async verifySearchResults(expectedResults) {
    const results = await this.getSearchResults();
    for (const result of expectedResults) {
      await this.I.see(result, this.selectors.searchResults);
    }
  }

  async verifyNoResults(unexpectedResults) {
    // Verify each unexpected result is not visible
    for (const result of unexpectedResults) {
      await this.I.dontSee(result, `${this.selectors.searchResults} ${this.selectors.skillCell}`);
    }
  }

  async selectVersion(version) {
    // Wait for version selector and verify it's enabled
    await this.I.waitForElement(this.selectors.versionSelector, 20);
    await this.I.dontSeeAttribute(this.selectors.versionSelector, 'disabled');

    // Select version and wait for results to update
    await this.I.selectOption(this.selectors.versionSelector, version);
    await this.waitForSearchResults();
  }

  async toggleInstructions() {
    const toggle = this.I.locator(this.selectors.instructionsToggle);
    await toggle.waitFor({ state: 'visible', timeout: 5000 });
    await toggle.click();
    
    // Wait for animation to complete
    await this.I.page.waitForTimeout(500);
  }

  async getInstructionsVisibility() {
    const instructions = this.I.locator(this.selectors.instructions);
    try {
      await instructions.waitFor({ state: 'visible', timeout: 5000 });
      const isVisible = await instructions.isVisible();
      return isVisible;
    } catch (e) {
      return false;
    }
  }

  async toggleFilters() {
    await this.click(this.selectors.filterToggle);
  }

  async verifySkillLevel(skill, expectedLevel) {
    const skillRow = await this.I.locate(this.selectors.resultRows)
      .withText(skill);
    await this.I.see(expectedLevel, skillRow.find(this.selectors.levelCell));
  }

  async clearSearch() {
    await this.clearField(this.selectors.searchInput);
    await this.waitForSearchResults();
  }

  async verifyInitialState() {
    // Wait for critical elements
    await this.I.waitForElement(this.selectors.searchInput, 20);
    await this.I.waitForElement(this.selectors.searchResults, 20);
    await this.I.waitForElement(this.selectors.versionSelector, 20);

    // Verify elements are visible and enabled
    await this.I.seeElement(this.selectors.searchInput);
    await this.I.seeElement(this.selectors.searchResults);
    await this.I.seeElement(this.selectors.versionSelector);
    
    // Verify elements are not disabled
    await this.I.dontSeeAttribute(this.selectors.searchInput, 'disabled');
    await this.I.dontSeeAttribute(this.selectors.versionSelector, 'disabled');
  }
}

module.exports = SearchPage;
