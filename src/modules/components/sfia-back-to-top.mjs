/**
 * <sfia-back-to-top> — Scroll-to-top button Web Component.
 *
 * Renders a fixed-position button that becomes visible after the user scrolls
 * past a configurable threshold.  Clicking the button smoothly scrolls the
 * page back to the top.  All DOM and styling live inside Shadow DOM.
 *
 * Attributes:
 *   threshold — scroll distance (px) before the button appears (default 400)
 *
 * Usage:
 *   <sfia-back-to-top threshold="400"></sfia-back-to-top>
 */

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = /* html */`
<style>
  :host {
    display: block;
    position: fixed;
    bottom: 5rem;
    right: 1.5rem;
    z-index: 1040;
  }
  button {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    border: 1px solid light-dark(#d1d5db, #444);
    background: light-dark(#fff, #1a1a1a);
    color: light-dark(#2563eb, #60a5fa);
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px light-dark(rgba(0,0,0,0.08), rgba(0,0,0,0.4));
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: opacity 0.25s ease, visibility 0.25s ease,
                transform 0.25s ease, background 0.15s ease;
    padding: 0;
    line-height: 1;
  }
  button.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  button:hover {
    background: light-dark(#f3f4f6, #333);
    transform: translateY(-2px);
  }
  /* Keep hover uplift even when visible */
  button.visible:hover {
    transform: translateY(-2px);
  }
  @media print { :host { display: none !important; } }
</style>
<button aria-label="Back to top" title="Back to top">↑</button>
`;

class SfiaBackToTop extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    this._btn = this.shadowRoot.querySelector('button');
    this._onScroll = this._onScroll.bind(this);
  }

  /* ── observed attributes ─────────────────────────────────────────── */

  static get observedAttributes() { return ['threshold']; }

  get threshold() {
    return parseInt(this.getAttribute('threshold'), 10) || 400;
  }

  set threshold(val) {
    this.setAttribute('threshold', String(val));
  }

  /* ── lifecycle ───────────────────────────────────────────────────── */

  connectedCallback() {
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // Apply initial state based on current scroll position
    this._onScroll();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._onScroll);
  }

  /* ── private ─────────────────────────────────────────────────────── */

  /** @private */
  _onScroll() {
    this._btn.classList.toggle('visible', window.scrollY > this.threshold);
  }
}

customElements.define('sfia-back-to-top', SfiaBackToTop);
export default SfiaBackToTop;
