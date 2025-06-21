/**
 * Toggle between light and dark themes.
 */
const toggleTheme = () => {
    console.log('[DEBUG] toggleTheme called');
    const lightTheme = document.querySelector('link[href="styles-light.css"]');
    const darkTheme = document.querySelector('link[href="styles-dark.css"]');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-toggle-icon');
    let isLight;
 
    if (themeToggleBtn) {
        // Use the button state to determine theme (check icon or attribute)
        isLight = document.body.getAttribute('data-theme') !== 'dark';
        console.log('[DEBUG theme.mjs] Using theme-toggle-btn. isLight:', isLight);
    } else {
        // Fallback for legacy checkbox (should not be used)
        const themeSwitch = document.getElementById('theme-switch');
        isLight = themeSwitch ? !themeSwitch.checked : true;
        console.log('[DEBUG theme.mjs] Fallback to theme-switch. isLight:', isLight);
    }
 
    lightTheme.disabled = !isLight;
    darkTheme.disabled = isLight;
 
    // Save preference
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
 
    // Update icon and accessibility labels if present
    if (themeIcon && themeToggleBtn) {
        if (!isLight) {
            console.log('[ThemeToggle] Setting icon for light mode:', '🌞');
            themeIcon.textContent = '🌞';
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
            themeToggleBtn.setAttribute('title', 'Switch to light mode');
        } else {
            themeIcon.textContent = '🌙';
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            themeToggleBtn.setAttribute('title', 'Switch to dark mode');
        }
    }
 
    // Set data-theme attribute for CSS variables and accessibility
    document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');
    console.log('[DEBUG] data-theme now:', document.body.getAttribute('data-theme'));
 
    // Dispatch custom event for extensibility
    document.body.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: isLight ? 'light' : 'dark' }
    }));
};

/**
 * Initialize theme on DOM content loaded
 */
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-toggle-icon');
    const themeStyle = document.getElementById('theme-style');

    // Set theme stylesheet
    if (themeStyle) {
        themeStyle.setAttribute('href', savedTheme === 'dark' ? 'styles-dark.css' : 'styles-light.css');
    }
    // Set icon and labels
    if (themeIcon && themeToggleBtn) {
        if (savedTheme === 'dark') {
            console.log('[ThemeToggle] Setting icon for light mode:', '🌞');
            themeIcon.textContent = '🌞';
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
            themeToggleBtn.setAttribute('title', 'Switch to light mode');
        } else {
            themeIcon.textContent = '🌙';
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            themeToggleBtn.setAttribute('title', 'Switch to dark mode');
        }
    }
    // Set data-theme attribute for accessibility
    document.body.setAttribute('data-theme', savedTheme);

    console.log('[DEBUG theme.mjs] initializeTheme: savedTheme =', savedTheme);

    // Dispatch custom event for extensibility
    document.body.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: savedTheme }
    }));
};

// Load saved theme preference
document.addEventListener('DOMContentLoaded', initializeTheme);

/**
 * Additive API: Register a callback for theme changes.
 * The callback receives the new theme ('light' or 'dark').
 * This is additive and does not interfere with legacy event handling.
 */
const onThemeChange = (callback) => {
    // Listen for both legacy and new themechange events
    document.body.addEventListener('themechange', (e) => {
        if (e?.detail?.theme) callback(e.detail.theme);
    });
    // Optionally, call immediately with current theme for convenience
    const currentTheme = document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    callback(currentTheme);
};

// Optionally, dispatch an additional custom event for extensibility (additive, not replacing existing)
const dispatchThemeUpdated = (theme) => {
    document.body.dispatchEvent(new CustomEvent('theme-updated', {
        detail: { theme }
    }));
};

// Patch toggleTheme and initializeTheme to also dispatch 'theme-updated' (additive)
const _origToggleTheme = toggleTheme;
const _origInitializeTheme = initializeTheme;

const patchedToggleTheme = () => {
    _origToggleTheme();
    const theme = document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    dispatchThemeUpdated(theme);
};

const patchedInitializeTheme = () => {
    _origInitializeTheme();
    const theme = document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    dispatchThemeUpdated(theme);
};

// Export functions for module usage (additive, backward-compatible)
export { patchedToggleTheme as toggleTheme, patchedInitializeTheme as initializeTheme, onThemeChange };
