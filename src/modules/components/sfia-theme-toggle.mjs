/**
 * <sfia-theme-toggle> — Theme toggle button Web Component.
 *
 * Renders a 3-way theme toggle button (light → system → dark → light)
 * inside Shadow DOM.  Theme state management (localStorage, body classes,
 * data-theme attribute) is delegated to the existing `theme.mjs` module.
 *
 * The component:
 *   1. On connectedCallback reads the current body classes to display the
 *      correct icon.
 *   2. On click, calls `toggleTheme()` from theme.mjs.
 *   3. Listens for 'themechange' on document.body to stay in sync.
 *
 * Usage:
 *   <sfia-theme-toggle></sfia-theme-toggle>
 */

/* ── icon / label lookup ───────────────────────────────────────────── */
const THEME_UI = {
  light:  { icon: '🌙', label: 'Switch to dark mode' },
  system: { icon: '🖥️', label: 'Switch to dark mode' },
  dark:   { icon: '🌞', label: 'Switch to light mode' },
};

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = /* html */`
<style>
  :host { display: inline-flex; }
  button {
    background: light-dark(#f3f4f6, #222);
    border: 1px solid light-dark(#e2e5e9, #333);
    border-radius: 0.75rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }
  button:hover {
    background: light-dark(#e5e7eb, #333);
    transform: scale(1.05);
  }
  .icon {
    font-size: 1.2rem;
    line-height: 1;
    transition: transform 0.25s ease;
  }
  button:active .icon {
    transform: rotate(30deg);
  }
</style>
<button part="button">
  <span class="icon" part="icon">🌙</span>
</button>
`;

class SfiaThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    this._btn = this.shadowRoot.querySelector('button');
    this._icon = this.shadowRoot.querySelector('.icon');
    this._toggleTheme = null; // lazily resolved from theme.mjs
    this._syncUI = this._syncUI.bind(this);
  }

  /* ── lifecycle ───────────────────────────────────────────────────── */

  connectedCallback() {
    // Immediately reflect current theme in the icon
    this._syncUI();

    // Listen for future changes
    document.body.addEventListener('themechange', this._syncUI);
    document.body.addEventListener('theme-updated', this._syncUI);

    // Bind click → toggle
    this._btn.addEventListener('click', () => this._handleClick());
    this._btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._handleClick();
      }
    });
  }

  disconnectedCallback() {
    document.body.removeEventListener('themechange', this._syncUI);
    document.body.removeEventListener('theme-updated', this._syncUI);
  }

  /* ── private ─────────────────────────────────────────────────────── */

  /** Read current theme from body and update icon + aria-label. */
  _syncUI() {
    const dataTheme = document.body.getAttribute('data-theme');
    let key = 'light';
    if (dataTheme === 'dark') key = 'dark';
    else if (dataTheme === 'system') key = 'system';
    else if (document.body.classList.contains('dark-theme')) key = 'dark';
    else if (document.body.classList.contains('light-theme')) key = 'light';

    const ui = THEME_UI[key] || THEME_UI.light;
    this._icon.textContent = ui.icon;
    this._btn.setAttribute('aria-label', ui.label);
    this._btn.setAttribute('title', ui.label);
  }

  /** Lazily import theme.mjs and call toggleTheme(). */
  async _handleClick() {
    if (!this._toggleTheme) {
      try {
        const mod = await import('../theme.mjs');
        this._toggleTheme = mod.toggleTheme;
      } catch {
        // Fallback: look for global
        this._toggleTheme = window.toggleTheme || (() => {});
      }
    }
    this._toggleTheme();
  }
}

customElements.define('sfia-theme-toggle', SfiaThemeToggle);
export default SfiaThemeToggle;
