/**
 * <comprai-brand> — Web Component de marca Compraí.CC
 *
 * Tipografia:
 *   [compr]  — fonte secundária (sans), cor principal
 *   (aí)     — Montserrat ExtraBold, cor accent
 *   [.]      — fonte secundária, cor principal
 *   (CC)     — Montserrat ExtraBold, cor accent
 *
 * USO:
 *   <script src="https://cdn.developedby.cc/comprai-brand/comprai-brand.js"></script>
 *   <comprai-brand></comprai-brand>
 *
 * ATRIBUTOS:
 *   size        — "xs" | "sm" | "md" | "lg" | "xl" | "hero"  (default: "md")
 *   accent      — cor hex do accent               (default: #2ec4b0)
 *   color       — cor hex do texto principal      (default: #f5f5f0)
 *   sans        — família da parte secundária     (default: "Archivo")
 *   weight      — peso da parte secundária        (default: 900)
 *   theme       — "dark" | "light"                (default: "dark")
 *
 * EXEMPLOS:
 *   <comprai-brand></comprai-brand>
 *   <comprai-brand size="hero"></comprai-brand>
 *   <comprai-brand size="sm" accent="#d8b856"></comprai-brand>
 *   <comprai-brand theme="light" sans="DM Sans"></comprai-brand>
 *   <comprai-brand color="#ffffff" accent="#2ec4b0" size="lg"></comprai-brand>
 */

class CompraiBrand extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'accent', 'color', 'sans', 'weight', 'theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get _accent() {
    if (this.hasAttribute('accent')) return this.getAttribute('accent');
    return this.getAttribute('theme') === 'light' ? '#0f6e56' : '#2ec4b0';
  }
  get _color() {
    if (this.hasAttribute('color')) return this.getAttribute('color');
    return this.getAttribute('theme') === 'light' ? '#111312' : '#f5f5f0';
  }
  get _sans()   { return this.getAttribute('sans')   || 'Archivo'; }
  get _weight() { return this.getAttribute('weight') || '900'; }
  get _size()   { return this.getAttribute('size')   || 'md'; }

  connectedCallback()              { this._render(); }
  attributeChangedCallback()       { this._render(); }

  _render() {
    const sizes = {
      xs:   '0.75rem',
      sm:   '1rem',
      md:   '1.5rem',
      lg:   '2.2rem',
      xl:   '3.2rem',
      hero: '5.5rem',
    };
    const fs = sizes[this._size] || sizes.md;

    // Letter-spacing apertado só no hero e xl
    const ls = ['hero', 'xl'].includes(this._size) ? '-0.05em' : '-0.03em';

    // Encode a fonte pra URL do Google Fonts
    const gfSans   = encodeURIComponent(this._sans).replace(/%20/g, '+');
    const gfWeight = this._weight;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=${gfSans}:wght@${gfWeight}&display=swap');

        :host {
          display: inline-flex;
          align-items: baseline;
          font-size: ${fs};
          line-height: 1;
          letter-spacing: ${ls};
          font-weight: ${this._weight};
          user-select: none;
          cursor: default;
        }

        .base {
          font-family: '${this._sans}', sans-serif;
          font-weight: ${this._weight};
          color: ${this._color};
        }

        .accent {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          color: ${this._accent};
        }
      </style>

      <span class="base">compr</span><span class="accent">aí</span><span class="base">.</span><span class="accent">CC</span>
    `;
  }
}

customElements.define('comprai-brand', CompraiBrand);