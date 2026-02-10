/**
 * Theme FOUC (Flash of Unstyled Content) prevention script.
 *
 * This MUST be loaded as a blocking (non-module, non-deferred) script in <head>
 * so it runs before the browser paints the page, preventing a flash of the
 * wrong theme.
 *
 * It reads the stored theme from localStorage and applies the correct body
 * classes and data-theme attribute immediately.
 *
 * The full theme module (theme.mjs) takes over for toggling and events once
 * ES modules are loaded.
 *
 * Shared contract with theme.mjs:
 *   - localStorage key : 'theme-mode'
 *   - Body classes     : 'light-theme' + 'light-mode'  OR  'dark-theme' + 'dark-mode'
 *   - Attribute        : data-theme = 'light' | 'dark' | 'system'
 */
(function applyStoredTheme() {
  var STORAGE_KEY = 'theme-mode';
  var theme = localStorage.getItem(STORAGE_KEY);
  var body = document.body || document.documentElement;

  if (theme === 'dark') {
    body.classList.add('dark-theme', 'dark-mode');
    body.setAttribute('data-theme', 'dark');
  } else if (theme === 'light' || !theme) {
    body.classList.add('light-theme', 'light-mode');
    body.setAttribute('data-theme', 'light');
  } else {
    // 'system' or unknown — let the browser's color-scheme preference decide
    body.setAttribute('data-theme', 'system');
  }
})();
