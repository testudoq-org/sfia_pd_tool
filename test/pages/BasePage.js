const WaitHelper = require('../helpers/WaitHelper');

class BasePage {
  constructor(I) {
    this.I = I;
    this.waitHelper = new WaitHelper(I);
  }

  // Common selectors
  selectors = {
    header: 'header',
    footer: 'footer',
    loader: '.loader',
    errorMessage: '.error-message',
    successMessage: '.success-message'
  }

  // Common methods that can be used across all pages
  async waitForPageLoad() {
    await this.waitHelper.smartWait();
    await this.waitHelper.waitForLoaderToDisappear();
  }

  async verifyPageTitle(expectedTitle) {
    await this.I.seeInTitle(expectedTitle);
  }

  async seeSuccess(message) {
    await this.waitHelper.waitForText(message, 10, this.selectors.successMessage);
  }

  async seeError(message) {
    await this.waitHelper.waitForText(message, 10, this.selectors.errorMessage);
  }

  async clearField(selector) {
    await this.I.clearField(selector);
  }

  async fillField(selector, value) {
    await this.waitHelper.waitForVisible(selector);
    await this.I.fillField(selector, value);
  }

  async click(selector) {
    await this.waitHelper.waitForVisible(selector);
    await this.I.click(selector);
  }

  async seeElement(selector) {
    await this.waitHelper.waitForVisible(selector);
  }

  async dontSeeElement(selector) {
    await this.I.dontSeeElement(selector);
  }

  async seeInCurrentUrl(url) {
    await this.I.seeInCurrentUrl(url);
  }

  async scrollTo(selector) {
    await this.I.scrollTo(selector);
  }

  async takeScreenshot(name) {
    await this.I.saveScreenshot(name + '.png');
  }

  async retry(action, maxAttempts = 3) {
    return await this.waitHelper.retryUntilSuccessful(action, maxAttempts);
  }

  // Method to handle network issues
  async waitForRequest(urlPattern) {
    return await this.waitHelper.waitForResponse(urlPattern);
  }

  // Method to extract text content
  async getTextFrom(selector) {
    await this.waitHelper.waitForVisible(selector);
    return await this.I.grabTextFrom(selector);
  }

  // Method to check if element exists
  async elementExists(selector) {
    try {
      await this.waitHelper.waitForElement(selector, 5);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = BasePage;
