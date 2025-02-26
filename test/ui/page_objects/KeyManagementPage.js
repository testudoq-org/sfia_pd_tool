/**
 * Page object for Cohere API key management functionality
 * Handles interactions with API key input, storage, and validation
 */
class KeyManagementPage {
  constructor() {
    // Selectors for key management elements
    this.apiKeyInput = '#cohereApiKey';
    this.saveKeyButton = '#saveApiKey';
    this.keyStatusIndicator = '#keyStatus';
  }

  /**
   * Actions that can be performed on the key management page
   */
  async inputApiKey(I, key) {
    await I.fillField(this.apiKeyInput, key);
  }

  async saveApiKey(I) {
    await I.click(this.saveKeyButton);
    // Wait for storage operation
    await I.waitForResponse(response => response.url().includes('/api/saveKey'));
  }

  async verifyKeyStatus(I, expectedStatus) {
    await I.waitForElement(this.keyStatusIndicator);
    await I.see(expectedStatus, this.keyStatusIndicator);
  }

  async clearApiKey(I) {
    await I.fillField(this.apiKeyInput, '');
    await I.click(this.saveKeyButton);
    // Wait for storage operation
    await I.waitForResponse(response => response.url().includes('/api/saveKey'));
  }

  /**
   * Helper method to get current API key from input field
   */
  async getCurrentKey(I) {
    return await I.grabValueFrom(this.apiKeyInput);
  }

  /**
   * Helper method to verify key persistence after page reload
   */
  async verifyKeyPersistence(I, expectedKey) {
    await I.refreshPage();
    await I.waitForElement(this.apiKeyInput);
    const currentKey = await this.getCurrentKey(I);
    if (currentKey !== expectedKey) {
      throw new Error(`API key not persisted correctly. Expected: ${expectedKey}, Got: ${currentKey}`);
    }
  }
}

module.exports = KeyManagementPage;
