/**
 * Toggle between light and dark themes.
 */
const toggleTheme = () => {
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
            themeIcon.textContent = '🌞';
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
            themeToggleBtn.setAttribute('title', 'Switch to light mode');
        } else {
            themeIcon.textContent = '🌙';
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            themeToggleBtn.setAttribute('title', 'Switch to dark mode');
        }
    }
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

    toggleTheme();
};

// Load saved theme preference
document.addEventListener('DOMContentLoaded', initializeTheme);

// Export functions for module usage
export { toggleTheme, initializeTheme };