// Theme Management UI Test for /sfiapdgen.html

Feature('Theme Management');

Scenario('Verify theme toggle button switches between light and dark mode', async ({ I }) => {
  // Step 1: Open the page and check for the toggle button
  I.amOnPage('/sfiapdgen.html');
  I.seeElement('#theme-toggle-btn');
  I.seeElement('#theme-toggle-icon');

  // Step 2: Assert initial theme (light mode)
  I.executeScript(() => document.body.classList.contains('light-mode'));
  I.executeScript(() => document.body.getAttribute('data-theme') === 'light');
  I.seeElement('#theme-toggle-icon');
  I.see('🌙', '#theme-toggle-icon');

  // Step 3: Click toggle, assert dark mode
  I.click('#theme-toggle-btn');
  I.wait(0.5);
  I.executeScript(() => document.body.classList.contains('dark-mode'));
  I.executeScript(() => document.body.getAttribute('data-theme') === 'dark');
  I.see('🌞', '#theme-toggle-icon');
  I.seeAttributesOnElements('#theme-toggle-btn', { 'aria-label': 'Switch to light mode', 'title': 'Switch to light mode' });

  // Step 4: Click toggle again, assert light mode
  I.click('#theme-toggle-btn');
  I.wait(0.5);
  I.executeScript(() => document.body.classList.contains('light-mode'));
  I.executeScript(() => document.body.getAttribute('data-theme') === 'light');
  I.see('🌙', '#theme-toggle-icon');
  I.seeAttributesOnElements('#theme-toggle-btn', { 'aria-label': 'Switch to dark mode', 'title': 'Switch to dark mode' });
});