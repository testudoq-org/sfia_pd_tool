const { I } = inject();

class SearchPage {
  constructor() {
    // Selectors
    this.selectors = {
      searchInput: '#myInput',
      resultsTable: '.sfia-table'
    };
  }

  /**
   * Performs a search using the given query
   * @param {string} query - The search term to enter
   */
  async search(query) {
    await I.fillField(this.selectors.searchInput, query);
    await I.waitForVisible(this.selectors.resultsTable);
  }

  /**
   * Verifies search results contain expected text
   * @param {string} expectedText - Text that should be present
   * @param {string} unexpectedText - Text that should not be present
   */
  async verifySearchResults(expectedText, unexpectedText) {
    await within(this.selectors.resultsTable, async () => {
      await I.see(expectedText);
      if (unexpectedText) {
        await I.dontSee(unexpectedText);
      }
    });
  }
}

module.exports = new SearchPage();
