/**
 * <comprai-brand> — Web Component de marca Compraí
 *
 * Tipografia (baseada no mockup):
 *   Ghost C  — teal, Montserrat 800, deslocado à esquerda atrás do C principal
 *   (C)      — gold, Montserrat 800
 *   [OMPR]   — cor principal (branco), Montserrat 800
 *   [A]      — cor principal (branco), Montserrat 800
 *   (Í)      — teal, Montserrat 800
 *
 * USO:
 *   <script src="https://cdn.developedby.cc/comprai-brand/comprai-brand.js"></script>
 *   <comprai-brand></comprai-brand>
 *
 * ATRIBUTOS:
 *   size    — "xs" | "sm" | "md" | "lg" | "xl" | "hero"  (default: "md")
 *   teal    — cor hex do teal  (default: #2ec4b0)
 *   gold    — cor hex do gold  (default: #d8b856)
 *   color   — cor hex do texto principal  (default: #f5f5f0)
 *   theme   — "dark" | "light"  (default: "dark")
 *
 * EXEMPLOS:
 *   <comprai-brand></comprai-brand>
 *   <comprai-brand size="hero"></comprai-brand>
 *   <comprai-brand size="sm" theme="light"></comprai-brand>
 *   <comprai-brand teal="#2ec4b0" gold="#d8b856" size="lg"></comprai-brand>
 */

class CompraiBrand extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'teal', 'gold', 'color', 'theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get _teal() {
    if (this.hasAttribute('teal')) return this.getAttribute('teal');
    return this.getAttribute('theme') === 'light' ? '#0f6e56' : '#2ec4b0';
  }
  get _gold() {
    if (this.hasAttribute('gold')) return this.getAttribute('gold');
    return this.getAttribute('theme') === 'light' ? '#8a6e1f' : '#d8b856';
  }
  get _color() {
    if (this.hasAttribute('color')) return this.getAttribute('color');
    return this.getAttribute('theme') === 'light' ? '#111312' : '#f5f5f0';
  }
  get _size() { return this.getAttribute('size') || 'md'; }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

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

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap');

        :host {
          display: inline-flex;
          align-items: baseline;
          font-size: ${fs};
          line-height: 1;
          letter-spacing: -0.04em;
          user-select: none;
          cursor: default;
        }

        /* Wrapper do C — contém o ghost e o C real empilhados */
        .c-wrap {
          position: relative;
          display: inline-flex;
          align-items: baseline;
        }

        /* Ghost C — teal, atrás e deslocado levemente à esquerda */
        .c-ghost {
          position: absolute;
          left: -0.2em;
          top: 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          color: ${this._teal};
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
          line-height: 1;
        }

        /* C principal — gold, na frente */
        .c-main {
          position: relative;
          z-index: 1;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          color: ${this._gold};
        }

        /* OMPR + A — cor principal */
        .base {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          color: ${this._color};
        }

        /* Í — teal */
        .teal {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          color: ${this._teal};
        }
      </style>

      <span class="c-wrap">
        <span class="c-ghost" aria-hidden="true">C</span>
        <span class="c-main">C</span>
      </span>
      <span class="base">OMPR</span>
      <span class="base">A</span>
      <span class="teal">Í</span>
    `;
  }
}

customElements.define('comprai-brand', CompraiBrand);