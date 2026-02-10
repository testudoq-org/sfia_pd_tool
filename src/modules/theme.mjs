/**
 * Theme management module.
 *
 * Provides a 3-way toggle cycle: light → system → dark → light.
 * Uses the 'theme-mode' localStorage key as the single source of truth.
 * Body classes: light-theme / dark-theme  +  light-mode / dark-mode
 * Attribute   : data-theme = "light" | "dark" | "system"
 * Icons       : 🌙 (light) | 🖥️ (system) | 🌞 (dark)
 *
 * A tiny inline <script> in the HTML applies the stored theme immediately
 * to prevent FOUC. This module then takes over for toggling and events.
 */

/* ── helpers ────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'theme-mode';

/** Theme configuration: body classes, data-theme value, icon, and aria-label. */
const THEME_CONFIG = {
    dark:    { classes: ['dark-theme', 'dark-mode'],   dataTheme: 'dark',   icon: '🌞', label: 'Switch to light mode' },
    light:   { classes: ['light-theme', 'light-mode'], dataTheme: 'light',  icon: '🌙', label: 'Switch to dark mode' },
    system:  { classes: [],                            dataTheme: 'system', icon: '🖥️', label: 'Switch to dark mode' },
};

/**
 * Apply a theme to the document body and update the toggle button.
 * @param {'light'|'dark'|null} theme - null means "system"
 */
function applyTheme(theme) {
    const key = theme || 'system';
    const cfg = THEME_CONFIG[key] || THEME_CONFIG.system;
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-toggle-icon');

    // Reset classes and attribute
    body.classList.remove('light-theme', 'dark-theme', 'light-mode', 'dark-mode');
    body.removeAttribute('data-theme');

    // Apply new classes and data-theme
    cfg.classes.forEach(c => body.classList.add(c));
    body.setAttribute('data-theme', cfg.dataTheme);

    // Update toggle button
    if (themeIcon) themeIcon.textContent = cfg.icon;
    if (themeBtn) {
        themeBtn.setAttribute('aria-label', cfg.label);
        themeBtn.setAttribute('title', cfg.label);
    }
}

/** Persist theme preference (null clears the key). */
function storeTheme(theme) {
    if (theme) {
        localStorage.setItem(STORAGE_KEY, theme);
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/** Read the current theme from body classes. */
function getCurrentTheme() {
    if (document.body.classList.contains('dark-theme')) return 'dark';
    if (document.body.classList.contains('light-theme')) return 'light';
    return null; // system
}

/* ── public API ─────────────────────────────────────────────────────── */

/**
 * Toggle theme: light → system → dark → light
 */
const toggleTheme = () => {
    const current = getCurrentTheme();
    let next;
    if (current === 'light') {
        next = null;   // system
    } else if (current === 'dark') {
        next = 'light';
    } else {
        next = 'dark';
    }
    applyTheme(next);
    storeTheme(next);

    // Dispatch custom events for extensibility
    const resolvedTheme = next || 'system';
    document.body.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: resolvedTheme }
    }));
    document.body.dispatchEvent(new CustomEvent('theme-updated', {
        detail: { theme: resolvedTheme }
    }));
};

/**
 * Initialise theme on page load.
 * Applies the stored preference and binds the toggle button.
 */
const initializeTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    applyTheme(stored || 'light');

    // Bind toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        themeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    // Dispatch initial theme event
    const resolvedTheme = stored || 'light';
    document.body.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: resolvedTheme }
    }));
    document.body.dispatchEvent(new CustomEvent('theme-updated', {
        detail: { theme: resolvedTheme }
    }));
};

/**
 * Register a callback for theme changes.
 * The callback receives the new theme string.
 * It is also called immediately with the current theme.
 */
const onThemeChange = (callback) => {
    document.body.addEventListener('themechange', (e) => {
        if (e?.detail?.theme) callback(e.detail.theme);
    });
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    callback(currentTheme);
};

export { toggleTheme, initializeTheme, onThemeChange };
