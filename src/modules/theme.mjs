/**
 * Toggle between light and dark themes.
 */
const toggleTheme = () => {
    const lightTheme = document.querySelector('link[href="styles-light.css"]');
    const darkTheme = document.querySelector('link[href="styles-dark.css"]');
    const isLight = !document.getElementById('theme-switch').checked;
    
    lightTheme.disabled = !isLight;
    darkTheme.disabled = isLight;
    
    // Save preference
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
};

/**
 * Initialize theme on DOM content loaded
 */
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.getElementById('theme-switch').checked = savedTheme === 'dark';
    toggleTheme();
};

// Load saved theme preference
document.addEventListener('DOMContentLoaded', initializeTheme);

// Export functions for module usage
export { toggleTheme, initializeTheme };