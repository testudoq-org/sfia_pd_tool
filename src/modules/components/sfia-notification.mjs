/**
 * <sfia-notification> — Toast notification Web Component.
 *
 * Displays stacked, auto-dismissing toast messages with slide-in/fade-out
 * animations.  Uses **light DOM** so that notifications are accessible to
 * E2E test selectors (`.notification.success`, etc.).
 *
 * Usage (HTML):
 *   <sfia-notification id="notification-container"></sfia-notification>
 *
 * Usage (JS):
 *   document.querySelector('sfia-notification').show('Saved!', 'success', 3000);
 *
 * Or via custom event:
 *   document.dispatchEvent(new CustomEvent('sfia:notify', {
 *     detail: { message: 'Saved!', type: 'success', duration: 3000 }
 *   }));
 *
 * Supported types: 'success' | 'error' | 'info'
 */

/* ── Inject component styles once ──────────────────────────────────── */
const STYLE_ID = 'sfia-notification-styles';

function _injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = /* css */`
    sfia-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
      display: block;
      pointer-events: none;
    }
    sfia-notification .notification {
      position: relative;
      padding: 15px 40px 15px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      animation: sfia-notif-slideIn 0.5s ease-out;
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
      pointer-events: auto;
      font-family: inherit;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    sfia-notification .notification.fade-out { opacity: 0; }

    /* Type variants */
    sfia-notification .notification.success {
      background-color: light-dark(#ecfdf5, #064e3b);
      border: 1px solid light-dark(#a7f3d0, #065f46);
      color: light-dark(#065f46, #d1fae5);
    }
    sfia-notification .notification.error {
      background-color: light-dark(#fef2f2, #7f1d1d);
      border: 1px solid light-dark(#fecaca, #991b1b);
      color: light-dark(#991b1b, #fecaca);
    }
    sfia-notification .notification.info {
      background-color: light-dark(#eff6ff, #1e3a5f);
      border: 1px solid light-dark(#bfdbfe, #1e40af);
      color: light-dark(#1e40af, #bfdbfe);
    }

    /* Icon prefixes */
    sfia-notification .notification.success::before { content: '\\2714 '; font-weight: bold; margin-right: 0.25rem; }
    sfia-notification .notification.error::before   { content: '\\26A0 '; margin-right: 0.25rem; }
    sfia-notification .notification.info::before     { content: '\\2139 '; margin-right: 0.25rem; }

    /* Close button */
    sfia-notification .notification-close {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      font-size: 20px;
      font-weight: bold;
      color: inherit;
      opacity: 0.5;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0 5px;
      line-height: 1;
    }
    sfia-notification .notification-close:hover { opacity: 1; }

    @keyframes sfia-notif-slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    @media print { sfia-notification { display: none !important; } }
  `;
  document.head.appendChild(style);
}

class SfiaNotification extends HTMLElement {
  constructor() {
    super();
    this._handleEvent = this._handleEvent.bind(this);
  }

  /* ── lifecycle ───────────────────────────────────────────────────── */

  connectedCallback() {
    _injectStyles();
    // Set role for accessibility
    if (!this.getAttribute('role')) {
      this.setAttribute('role', 'status');
      this.setAttribute('aria-live', 'polite');
    }
    document.addEventListener('sfia:notify', this._handleEvent);
  }

  disconnectedCallback() {
    document.removeEventListener('sfia:notify', this._handleEvent);
  }

  /* ── public API ──────────────────────────────────────────────────── */

  /**
   * Display a toast notification.
   * @param {string} message  — text to show
   * @param {'success'|'error'|'info'} [type='success']
   * @param {number} [duration=5000]  — ms before auto-dismiss (0 = manual only)
   */
  show(message, type = 'success', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `notification ${type}`;

    const msg = document.createElement('span');
    msg.textContent = message;

    const btn = document.createElement('button');
    btn.className = 'notification-close';
    btn.innerHTML = '&times;';
    btn.setAttribute('aria-label', 'Close notification');
    btn.addEventListener('click', () => this._dismiss(toast));

    toast.appendChild(msg);
    toast.appendChild(btn);
    this.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) this._dismiss(toast);
      }, duration);
    }
  }

  /* ── private helpers ─────────────────────────────────────────────── */

  /** @private */
  _dismiss(toast) {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }

  /** @private  Handle the `sfia:notify` custom event. */
  _handleEvent(e) {
    const { message, type, duration } = e.detail || {};
    if (message) this.show(message, type, duration);
  }
}

customElements.define('sfia-notification', SfiaNotification);
export default SfiaNotification;
