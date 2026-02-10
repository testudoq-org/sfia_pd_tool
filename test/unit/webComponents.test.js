/**
 * Unit tests for the three SFIA Web Components:
 *   <sfia-notification>
 *   <sfia-back-to-top>
 *   <sfia-theme-toggle>
 *
 * Components are loaded via the vm module (same approach as virtualScroller tests)
 * since dynamic import() doesn't work in the Jest VM context.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * Load a Web Component .mjs file, strip ES module syntax, and evaluate it
 * in the current jsdom context so customElements.define() registers the element.
 */
function loadComponent(relativePath) {
    const filePath = path.resolve(__dirname, relativePath);
    let source = fs.readFileSync(filePath, 'utf8');

    // Strip only top-level static import/export statements (not dynamic import())
    // Static imports: lines starting with "import" followed by from/string
    source = source.replace(/^\s*import\s+(?:(?:\{[^}]*\}|[\w*]+)\s+from\s+)?['"][^'"]+['"];?\s*$/gm, '');
    // export default
    source = source.replace(/^\s*export\s+default\s+\w+;?\s*$/gm, '');

    // Replace dynamic import() with a mock that returns an empty module
    source = source.replace(/\bimport\s*\(\s*['"][^'"]+['"]\s*\)/g,
        'Promise.resolve({ toggleTheme: function() {} })');

    const sandbox = {
        document,
        window,
        HTMLElement,
        customElements,
        console,
        CustomEvent,
        Event,
        Promise,
        setTimeout: (...args) => setTimeout(...args),
        clearTimeout: (...args) => clearTimeout(...args),
        localStorage: global.localStorage,
        Object,
        parseInt,
        String,
    };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox);
}

/* ── helpers ─────────────────────────────────────────────────────── */
function createElement(tag, attrs = {}) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.body.appendChild(el);
    return el;
}

function cleanup() {
    document.body.innerHTML = '';
}

/* ══════════════════════════════════════════════════════════════════
   <sfia-notification>
   ══════════════════════════════════════════════════════════════════ */
describe('<sfia-notification>', () => {
    beforeAll(() => {
        loadComponent('../../src/modules/components/sfia-notification.mjs');
    });

    afterEach(cleanup);

    test('is registered as a custom element', () => {
        expect(customElements.get('sfia-notification')).toBeDefined();
    });

    test('uses light DOM (no shadow root)', () => {
        const el = createElement('sfia-notification');
        expect(el.shadowRoot).toBeNull();
    });

    test('show() appends a notification to the element', () => {
        const el = createElement('sfia-notification');
        el.show('Hello', 'success', 0);
        const notifications = el.querySelectorAll('.notification');
        expect(notifications.length).toBe(1);
        expect(notifications[0].classList.contains('success')).toBe(true);
        expect(notifications[0].querySelector('span').textContent).toBe('Hello');
    });

    test('show() supports error and info types', () => {
        const el = createElement('sfia-notification');
        el.show('Oops', 'error', 0);
        el.show('FYI', 'info', 0);
        const notifications = el.querySelectorAll('.notification');
        expect(notifications[0].classList.contains('error')).toBe(true);
        expect(notifications[1].classList.contains('info')).toBe(true);
    });

    test('close button adds fade-out class on click', () => {
        const el = createElement('sfia-notification');
        el.show('Bye', 'success', 0);
        const closeBtn = el.querySelector('.notification-close');
        expect(closeBtn).not.toBeNull();
        closeBtn.click();
        // Should add fade-out class immediately
        const notification = el.querySelector('.notification');
        expect(notification.classList.contains('fade-out')).toBe(true);
    });

    test('auto-dismiss removes notification after duration', (done) => {
        const el = createElement('sfia-notification');
        el.show('Temp', 'info', 50); // short duration for test speed
        expect(el.querySelectorAll('.notification').length).toBe(1);
        // Wait for dismiss + fade-out
        setTimeout(() => {
            const notification = el.querySelector('.notification');
            // The notification should have fade-out or be gone
            if (notification) {
                expect(notification.classList.contains('fade-out')).toBe(true);
            }
            done();
        }, 100);
    });

    test('responds to sfia:notify custom event', () => {
        const el = createElement('sfia-notification');
        document.dispatchEvent(new CustomEvent('sfia:notify', {
            detail: { message: 'Event!', type: 'error', duration: 0 }
        }));
        const notifications = el.querySelectorAll('.notification');
        expect(notifications.length).toBe(1);
        expect(notifications[0].querySelector('span').textContent).toBe('Event!');
    });

    test('close button has aria-label', () => {
        const el = createElement('sfia-notification');
        el.show('A11y', 'success', 0);
        const btn = el.querySelector('.notification-close');
        expect(btn.getAttribute('aria-label')).toBe('Close notification');
    });

    test('host element has role=status and aria-live', () => {
        const el = createElement('sfia-notification');
        expect(el.getAttribute('role')).toBe('status');
        expect(el.getAttribute('aria-live')).toBe('polite');
    });

    test('multiple notifications stack', () => {
        const el = createElement('sfia-notification');
        el.show('One', 'success', 0);
        el.show('Two', 'error', 0);
        el.show('Three', 'info', 0);
        expect(el.querySelectorAll('.notification').length).toBe(3);
    });

    test('disconnectedCallback removes event listener (no error on event)', () => {
        const el = createElement('sfia-notification');
        el.remove();
        // Should not throw when dispatching after removal
        expect(() => {
            document.dispatchEvent(new CustomEvent('sfia:notify', {
                detail: { message: 'Ghost', type: 'info', duration: 0 }
            }));
        }).not.toThrow();
    });
});

/* ══════════════════════════════════════════════════════════════════
   <sfia-back-to-top>
   ══════════════════════════════════════════════════════════════════ */
describe('<sfia-back-to-top>', () => {
    beforeAll(() => {
        loadComponent('../../src/modules/components/sfia-back-to-top.mjs');
    });

    afterEach(cleanup);

    test('is registered as a custom element', () => {
        expect(customElements.get('sfia-back-to-top')).toBeDefined();
    });

    test('creates shadow DOM with a button', () => {
        const el = createElement('sfia-back-to-top');
        expect(el.shadowRoot).not.toBeNull();
        expect(el.shadowRoot.querySelector('button')).not.toBeNull();
    });

    test('button has aria-label and title', () => {
        const el = createElement('sfia-back-to-top');
        const btn = el.shadowRoot.querySelector('button');
        expect(btn.getAttribute('aria-label')).toBe('Back to top');
        expect(btn.getAttribute('title')).toBe('Back to top');
    });

    test('default threshold is 400', () => {
        const el = createElement('sfia-back-to-top');
        expect(el.threshold).toBe(400);
    });

    test('threshold attribute is reflected', () => {
        const el = createElement('sfia-back-to-top', { threshold: '200' });
        expect(el.threshold).toBe(200);
    });

    test('button starts hidden (no visible class)', () => {
        const el = createElement('sfia-back-to-top');
        const btn = el.shadowRoot.querySelector('button');
        expect(btn.classList.contains('visible')).toBe(false);
    });

    test('button becomes visible when scrollY > threshold', () => {
        const el = createElement('sfia-back-to-top', { threshold: '100' });
        const btn = el.shadowRoot.querySelector('button');
        // Simulate scroll
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
        window.dispatchEvent(new Event('scroll'));
        expect(btn.classList.contains('visible')).toBe(true);
        // Scroll back up
        Object.defineProperty(window, 'scrollY', { value: 50, writable: true, configurable: true });
        window.dispatchEvent(new Event('scroll'));
        expect(btn.classList.contains('visible')).toBe(false);
        // Reset
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    });

    test('click calls window.scrollTo', () => {
        const el = createElement('sfia-back-to-top');
        const btn = el.shadowRoot.querySelector('button');
        const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
        btn.click();
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        scrollToSpy.mockRestore();
    });

    test('disconnectedCallback removes scroll listener', () => {
        const el = createElement('sfia-back-to-top');
        const spy = jest.spyOn(window, 'removeEventListener');
        el.remove();
        expect(spy).toHaveBeenCalledWith('scroll', expect.any(Function));
        spy.mockRestore();
    });
});

/* ══════════════════════════════════════════════════════════════════
   <sfia-theme-toggle>
   ══════════════════════════════════════════════════════════════════ */
describe('<sfia-theme-toggle>', () => {
    beforeAll(() => {
        loadComponent('../../src/modules/components/sfia-theme-toggle.mjs');
    });

    afterEach(() => {
        cleanup();
        document.body.removeAttribute('data-theme');
        document.body.classList.remove('light-theme', 'dark-theme', 'light-mode', 'dark-mode');
    });

    test('is registered as a custom element', () => {
        expect(customElements.get('sfia-theme-toggle')).toBeDefined();
    });

    test('creates shadow DOM with button and icon', () => {
        const el = createElement('sfia-theme-toggle');
        expect(el.shadowRoot).not.toBeNull();
        expect(el.shadowRoot.querySelector('button')).not.toBeNull();
        expect(el.shadowRoot.querySelector('.icon')).not.toBeNull();
    });

    test('syncs icon to light theme by default', () => {
        document.body.setAttribute('data-theme', 'light');
        document.body.classList.add('light-theme');
        const el = createElement('sfia-theme-toggle');
        const icon = el.shadowRoot.querySelector('.icon');
        expect(icon.textContent).toBe('🌙');
    });

    test('syncs icon to dark theme', () => {
        document.body.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
        const el = createElement('sfia-theme-toggle');
        const icon = el.shadowRoot.querySelector('.icon');
        expect(icon.textContent).toBe('🌞');
    });

    test('syncs icon to system theme', () => {
        document.body.setAttribute('data-theme', 'system');
        const el = createElement('sfia-theme-toggle');
        const icon = el.shadowRoot.querySelector('.icon');
        expect(icon.textContent).toBe('🖥️');
    });

    test('updates icon on themechange event', () => {
        document.body.setAttribute('data-theme', 'light');
        const el = createElement('sfia-theme-toggle');
        // Simulate theme change to dark
        document.body.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
        document.body.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: 'dark' }
        }));
        const icon = el.shadowRoot.querySelector('.icon');
        expect(icon.textContent).toBe('🌞');
    });

    test('button has aria-label', () => {
        document.body.setAttribute('data-theme', 'light');
        const el = createElement('sfia-theme-toggle');
        const btn = el.shadowRoot.querySelector('button');
        expect(btn.getAttribute('aria-label')).toBeTruthy();
    });

    test('button has title attribute', () => {
        document.body.setAttribute('data-theme', 'light');
        const el = createElement('sfia-theme-toggle');
        const btn = el.shadowRoot.querySelector('button');
        expect(btn.getAttribute('title')).toBeTruthy();
    });

    test('exposes part attributes for external CSS', () => {
        const el = createElement('sfia-theme-toggle');
        const btn = el.shadowRoot.querySelector('button');
        const icon = el.shadowRoot.querySelector('.icon');
        expect(btn.getAttribute('part')).toBe('button');
        expect(icon.getAttribute('part')).toBe('icon');
    });

    test('disconnectedCallback removes event listeners (no error)', () => {
        document.body.setAttribute('data-theme', 'light');
        const el = createElement('sfia-theme-toggle');
        el.remove();
        expect(() => {
            document.body.dispatchEvent(new CustomEvent('themechange', {
                detail: { theme: 'dark' }
            }));
        }).not.toThrow();
    });
});
