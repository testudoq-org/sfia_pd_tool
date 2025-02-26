/**
 * Page object for SFIA Skills Editor functionality
 * Handles interactions with skills selection, editor updates, and clipboard operations
 */
class SkillsEditorPage {
  constructor() {
    // Selectors for skills editor elements
    this.skillSearchInput = '#myInput';
    this.updateButton = '#updateButton';
    this.copyButton = '#copyButton';
    this.editorContent = '#editor';
    this.skillsContainer = '#skillsContainer';
  }

  /**
   * Search for a specific skill
   * @param {CodeceptJS.I} I - CodeceptJS actor
   * @param {string} skillName - Name of the skill to search for
   */
  async searchSkill(I, skillName) {
    await I.fillField(this.skillSearchInput, skillName);
    // Wait for search results to update
    await I.waitForElement(`${this.skillsContainer} input[type="checkbox"]`);
  }

  /**
   * Select a skill at a specific level
   * @param {CodeceptJS.I} I - CodeceptJS actor
   * @param {string} skill - Skill name
   * @param {number} level - Skill level
   */
  async selectSkill(I, skill, level) {
    const selector = `//input[@type='checkbox' and contains(@sfia-data, '"skill":"${skill}","level":${level}')]`;
    await I.click(selector);
    await I.seeCheckboxIsChecked(selector);
  }

  /**
   * Deselect a skill at a specific level
   * @param {CodeceptJS.I} I - CodeceptJS actor
   * @param {string} skill - Skill name
   * @param {number} level - Skill level
   */
  async deselectSkill(I, skill, level) {
    const selector = `//input[@type='checkbox' and contains(@sfia-data, '"skill":"${skill}","level":${level}')]`;
    await I.click(selector);
    await I.dontSeeCheckboxIsChecked(selector);
  }

  /**
   * Click update button and wait for editor content to update
   * @param {CodeceptJS.I} I - CodeceptJS actor
   */
  async clickUpdate(I) {
    await I.click(this.updateButton);
    // Wait for editor content to update
    await I.waitForFunction(
      selector => document.querySelector(selector).innerText.length > 0,
      this.editorContent.substring(1)
    );
  }

  /**
   * Copy editor content to clipboard
   * @param {CodeceptJS.I} I - CodeceptJS actor
   */
  async copyToClipboard(I) {
    await I.click(this.copyButton);
    // Verify copy operation
    await I.waitForFunction(() => {
      return navigator.clipboard.readText()
        .then(text => text.length > 0)
        .catch(() => false);
    });
  }

  /**
   * Verify editor content contains expected text
   * @param {CodeceptJS.I} I - CodeceptJS actor
   * @param {string} expectedText - Text that should be present in editor
   */
  async verifyEditorContent(I, expectedText) {
    await I.see(expectedText, this.editorContent);
  }

  /**
   * Wait for AI conversation initialization
   * @param {CodeceptJS.I} I - CodeceptJS actor
   */
  async waitForAiConversation(I) {
    await I.waitForResponse(
      response => response.url().includes('/api/cohere'),
      30
    );
  }

  /**
   * Verify URL hash contains expected skill and level
   * @param {CodeceptJS.I} I - CodeceptJS actor
   * @param {string} skill - Skill code
   * @param {number} level - Skill level
   */
  async verifyUrlHash(I, skill, level) {
    const expectedHash = `#${skill}-${level}`;
    await I.seeInCurrentUrl(expectedHash);
  }
}

module.exports = SkillsEditorPage;
