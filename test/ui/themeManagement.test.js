// Theme Management UI Test for /sfiapdgen.html

Feature('Theme Management');

Scenario('Verify theme toggle button switches between light and dark mode', async ({ I }) => {
  // Step 1: Open the page and check for the toggle button
  I.amOnPage('/sfiapdgen.html');
  I.seeElement('#theme-toggle-btn');
  I.seeElement('#theme-toggle-icon');

  // Step 1: Initial state - light mode, icon "🌙"
  I.executeScript(() => {
    const icon = document.querySelector('#theme-toggle-icon')?.textContent;
    // eslint-disable-next-line no-console
    console.log('Initial icon:', icon);
    return document.body.classList.contains('light-mode');
  });
  I.executeScript(() => document.body.getAttribute('data-theme') === 'light');
  I.see('🌙', '#theme-toggle-icon');

  // Step 2: Click toggle, assert system/default mode, icon "🖥️"
  I.click('#theme-toggle-btn');
  I.wait(0.5);
  I.executeScript(() => {
    const icon = document.querySelector('#theme-toggle-icon')?.textContent;
    // eslint-disable-next-line no-console
    console.log('After 1st toggle icon:', icon);
    return document.body.getAttribute('data-theme') === 'system';
  });
  I.see('🖥️', '#theme-toggle-icon');

  // Step 3: Click toggle, assert dark mode, icon "🌞"
  I.click('#theme-toggle-btn');
  I.wait(0.5);
  I.executeScript(() => {
    const icon = document.querySelector('#theme-toggle-icon')?.textContent;
    // eslint-disable-next-line no-console
    console.log('After 2nd toggle icon:', icon);
    return document.body.classList.contains('dark-mode');
  });
  I.executeScript(() => document.body.getAttribute('data-theme') === 'dark');
  I.see('🌞', '#theme-toggle-icon');

  // Step 4: Click toggle again, assert light mode, icon "🌙"
  I.click('#theme-toggle-btn');
  I.wait(0.5);
  I.executeScript(() => {
    const icon = document.querySelector('#theme-toggle-icon')?.textContent;
    // eslint-disable-next-line no-console
    console.log('After 3rd toggle icon:', icon);
    return document.body.classList.contains('light-mode');
  });
  I.executeScript(() => document.body.getAttribute('data-theme') === 'light');
  I.see('🌙', '#theme-toggle-icon');
});