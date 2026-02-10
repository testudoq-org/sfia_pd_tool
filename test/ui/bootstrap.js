module.exports = async function() {
  const { event, actor } = require('codeceptjs');

  // Ensure SFIA data has loaded before each test scenario begins
  event.dispatcher.on(event.names.test.before, async () => {
    const I = actor();
    try {
      // Wait up to 20s for the SFIA data-loaded marker
      await I.waitForElement('body[data-sfia-loaded="true"]', 20);
      console.log('[BOOTSTRAP] SFIA data loaded before test start');
    } catch (err) {
      console.warn('[BOOTSTRAP] SFIA data did not appear before test start:', err && err.message ? err.message : err);
    }
  });
};
