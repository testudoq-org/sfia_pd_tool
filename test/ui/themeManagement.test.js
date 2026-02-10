// Theme Management UI Test for /sfiapdgen.html
const assert = require('assert');

Feature('Theme Management');

Scenario('Verify theme toggle button switches between light and dark mode', async ({ I }) => {
  // Step 1: Open the page and check for the toggle component
  I.amOnPage('/sfiapdgen.html');
  I.seeElement('sfia-theme-toggle');

  // Helper: read icon text from shadow DOM
  const getIcon = () => I.executeScript(() => {
    const el = document.querySelector('sfia-theme-toggle');
    return el && el.shadowRoot
      ? el.shadowRoot.querySelector('.icon').textContent.trim()
      : null;
  });

  // Helper: click the toggle button inside shadow DOM
  const clickToggle = () => I.executeScript(() => {
    document.querySelector('sfia-theme-toggle').shadowRoot.querySelector('button').click();
  });

  // Step 1: Initial state - light mode, icon "🌙"
  const dataTheme1 = await I.executeScript(() => document.body.getAttribute('data-theme'));
  assert.strictEqual(dataTheme1, 'light');
  const icon1 = await getIcon();
  assert.strictEqual(icon1, '🌙');

  // Step 2: Click toggle, assert system/default mode, icon "🖥️"
  await clickToggle();
  I.wait(0.5);
  const dataTheme2 = await I.executeScript(() => document.body.getAttribute('data-theme'));
  assert.strictEqual(dataTheme2, 'system');
  const icon2 = await getIcon();
  assert.strictEqual(icon2, '🖥️');

  // Step 3: Click toggle, assert dark mode, icon "🌞"
  await clickToggle();
  I.wait(0.5);
  const dataTheme3 = await I.executeScript(() => document.body.getAttribute('data-theme'));
  assert.strictEqual(dataTheme3, 'dark');
  const icon3 = await getIcon();
  assert.strictEqual(icon3, '🌞');

  // Step 4: Click toggle again, assert light mode, icon "🌙"
  await clickToggle();
  I.wait(0.5);
  const dataTheme4 = await I.executeScript(() => document.body.getAttribute('data-theme'));
  assert.strictEqual(dataTheme4, 'light');
  const icon4 = await getIcon();
  assert.strictEqual(icon4, '🌙');
});