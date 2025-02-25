class WaitHelper {
  constructor(I) {
    this.I = I;
  }

  async waitForVisible(selector, timeout = 10) {
    await this.I.waitForVisible(selector, timeout);
  }

  async waitForElement(selector, timeout = 10) {
    await this.I.waitForElement(selector, timeout);
  }

  async waitForText(text, timeout = 10, context = null) {
    await this.I.waitForText(text, timeout, context);
  }

  async smartWait(timeout = 10000) {
    try {
      // Wait for network to be idle and page load
      await Promise.all([
        this.I.waitForResponse(response => response.status() === 200, timeout),
        this.I.waitForLoadState('networkidle', timeout),
        this.I.waitForLoadState('domcontentloaded', timeout)
      ]);
    } catch (e) {
      console.log('Some wait conditions were not met:', e.message);
      // Continue execution as page might still be usable
    }
  }

  async waitForLoaderToDisappear(loaderSelector = '.loader') {
    try {
      await this.I.waitForInvisible(loaderSelector, 10);
    } catch (e) {
      // If loader is not present, that's fine
      console.log('No loader found, continuing...');
    }
  }

  async waitForResponse(urlPattern, timeout = 10) {
    return await this.I.waitForResponse(response => {
      return response.url().match(urlPattern) && response.status() === 200;
    }, timeout);
  }

  async retryUntilSuccessful(action, maxAttempts = 3, interval = 1000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        await action();
        return true;
      } catch (e) {
        attempts++;
        if (attempts === maxAttempts) {
          throw e;
        }
        await this.I.wait(interval);
      }
    }
    return false;
  }

  async waitForTableLoad(tableSelector = '.sfia-table') {
    await this.waitForVisible(tableSelector);
    await this.I.wait(1); // Small wait for any animations
  }

  async waitForUrlChange(expectedUrl) {
    await this.I.waitInUrl(expectedUrl);
  }

  async waitForDownload(timeout = 10) {
    await this.I.waitForDownload(timeout);
  }
}

module.exports = WaitHelper;
