/**
 * <cc-logo> — Web Component oficial da CC Soluções
 *
 * USO:
 *   <script src="cc-logo.js"></script>
 *   <cc-logo></cc-logo>
 *
 * ATRIBUTOS:
 *   words     — palavras rotativas separadas por | (default: built-in list)
 *   hold      — ms entre trocas (default: 3200)
 *   size      — "sm" | "md" | "lg" (default: "md")
 *   theme     — "dark" | "light" (default: "dark")
 *   no-icon   — omite o favicon (default: false)
 *   icon-src  — caminho do favicon (default: "assets/favicon.png")
 *
 * EXEMPLOS:
 *   <cc-logo></cc-logo>
 *   <cc-logo theme="light" size="sm"></cc-logo>
 *   <cc-logo words="em Websites|em Automação|em UX" hold="4000"></cc-logo>
 *   <cc-logo no-icon></cc-logo>
 *   <cc-logo icon-src="/img/logo.png"></cc-logo>
 */

class CCLogo extends HTMLElement {
  static get observedAttributes() {
    return ['words', 'hold', 'size', 'theme', 'no-icon', 'icon-src'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
    this._i = 0;
  }

  get _words() {
    const raw = this.getAttribute('words');
    if (raw) return ['', ...raw.split('|').map(w => w.trim()).filter(Boolean)];
    return ['', 'em Websites', 'em Automação', 'em UX', 'em Tecnologia', 'em Operação Digital'];
  }
  get _hold()    { return parseInt(this.getAttribute('hold') || '3200', 10); }
  get _size()    { return this.getAttribute('size') || 'md'; }
  get _theme()   { return this.getAttribute('theme') || 'dark'; }
  get _noIcon()  { return this.hasAttribute('no-icon'); }
  get _iconSrc() { return this.getAttribute('icon-src') || 'assets/favicon.png'; }

  connectedCallback() { this._render(); this._startSmoke(); }
  disconnectedCallback() { clearTimeout(this._timer); }
  attributeChangedCallback() { if (this.shadowRoot.innerHTML) { this._render(); this._startSmoke(); } }

  _render() {
    clearTimeout(this._timer);
    this._i = 0;

    const sizes = {
      sm: { logo: '1rem',   cc: '1.6rem',  img: '22px' },
      md: { logo: '1.25rem', cc: '2.15rem', img: '32px' },
      lg: { logo: '1.6rem', cc: '2.8rem',  img: '42px' },
    };
    const s = sizes[this._size] || sizes.md;

    const isDark = this._theme !== 'light';
    const colorCC       = isDark ? '#2ec4b0' : '#0f6e56';
    const colorSolucoes = isDark ? '#f5f5f0' : '#111312';
    const colorSub      = isDark ? '#7a8a85' : '#5a6a65';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Rubik:wght@500&display=swap');

        :host {
          display: inline-flex;
          align-items: center;
          font-size: ${s.logo};
          position: relative;
          cursor: default;
          user-select: none;
        }

        .wrap {
          display: flex;
          align-items: center;
          position: relative;
        }

        img.icon {
          height: ${s.img};
          width: ${s.img};
          margin: 0 5px;
          transition: transform .3s ease;
          will-change: transform;
          flex-shrink: 0;
        }
        img.icon.spin {
          animation: logoSpin 900ms cubic-bezier(.4,0,.2,1);
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .cc {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          letter-spacing: -0.075em;
          font-size: ${s.cc};
          color: ${colorCC};
          will-change: color;
          transition: color 900ms ease;
          line-height: 1;
        }

        .solucoes-wrap {
          display: inline-flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
        }

        .solucoes {
          font-family: 'Rubik', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.025em;
          font-weight: 500;
          margin-left: 0.05em;
          color: ${colorSolucoes};
          font-size: ${s.logo};
          line-height: 1;
        }

        .sub {
          position: absolute;
          bottom: -0.575rem;
          right: 0;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          font-size: 0.85em;
          overflow: visible;
          pointer-events: none;
        }

        .smoke {
          display: inline-block;
          font-family: 'Rubik', sans-serif;
          font-weight: 400;
          font-size: 0.78em;
          color: ${colorSub};
          letter-spacing: 0em;
          will-change: opacity, transform, filter;
          transition: opacity 900ms ease, transform 900ms ease, filter 900ms ease;
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0px);
          white-space: nowrap;
        }
        .dot {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 0.85em;
          color: ${colorCC};
          will-change: opacity, transform, filter;
          transition: opacity 900ms ease, transform 900ms ease, filter 900ms ease;
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0px);
        }

        .smoke.is-out, .dot.is-out {
          opacity: 0;
          transform: translateY(-10px) scale(1.02);
          filter: blur(8px);
        }
        .smoke.is-in, .dot.is-in {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          filter: blur(10px);
        }
      </style>

      <div class="wrap">
        ${!this._noIcon ? `<img class="icon" src="${this._iconSrc}" alt="" draggable="false"/>` : ''}
        <span class="cc">CC</span>
        <span class="solucoes-wrap">
          <span class="solucoes">Soluções</span>
          <span class="sub">
            <span class="smoke"></span>
            <span class="dot is-out">.</span>
          </span>
        </span>
      </div>
    `;
  }

  _startSmoke() {
    const sr = this.shadowRoot;
    const el  = sr.querySelector('.smoke');
    const dot = sr.querySelector('.dot');
    const icon = sr.querySelector('img.icon');
    const words = this._words;
    const hold  = this._hold;
    if (!el) return;

    this._i = 0;

    const spin = () => {
      if (!icon) return;
      icon.classList.remove('spin');
      void icon.offsetWidth;
      icon.classList.add('spin');
    };

    const next = () => {
      el.classList.remove('is-in');
      el.classList.add('is-out');
      dot.classList.remove('is-in');
      dot.classList.add('is-out');

      setTimeout(() => {
        el.classList.remove('is-out');
        el.classList.add('is-in');
        dot.classList.remove('is-out');
        dot.classList.add('is-in');
        spin();

        this._i = (this._i + 1) % words.length;
        el.textContent = words[this._i];
        if (this._i === 0) dot.classList.add('is-out');

        setTimeout(() => {
          el.classList.remove('is-in');
          dot.classList.remove('is-in');
          spin();
          this._timer = setTimeout(next, hold);
        }, 80);
      }, 900);
    };

    el.textContent = words[0];
    this._timer = setTimeout(next, 10);
  }
}

customElements.define('cc-logo', CCLogo);