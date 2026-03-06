/* cc-ambient gold-dust v1 (CDN module)
   Usage:
   <section cc-ambient="gold-dust" data-color="#CFAF6D" data-intensity="low|medium|high|0..1"></section>
*/
(() => {
  const REDUCE = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (REDUCE) return;
  const COLOR_PRESETS = {
    gold: "#D4AF37",
    warmgold: "#CFAF6D",
    champagne: "#E6D2A8",
    wine: "#6E2034",
    ivory: "#F2E9D8",
  };

  const INTENSITY_PRESETS = {
    low: 1.30,
    medium: 3.55,
    high: 12.85,
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (min, max) => min + Math.random() * (max - min);

  function parseColor(el) {
    const raw = (el.getAttribute("data-color") || "").trim().toLowerCase();
    if (!raw) return hexToRgb(COLOR_PRESETS.warmgold);
    if (COLOR_PRESETS[raw]) return hexToRgb(COLOR_PRESETS[raw]);
    return hexToRgb(raw); // assume hex like #CFAF6D
  }

  function parseIntensity(el) {
    const raw = (el.getAttribute("data-intensity") || "").trim().toLowerCase();
    if (!raw) return INTENSITY_PRESETS.medium;
    if (INTENSITY_PRESETS[raw] != null) return INTENSITY_PRESETS[raw];
    const num = Number(raw);
    if (Number.isFinite(num)) return clamp(num, 0, 1);
    return INTENSITY_PRESETS.medium;
  }

  function hexToRgb(hex) {
    // Accept #RGB or #RRGGBB. Fallback to warm gold if invalid.
    let h = (hex || "").trim();
    if (!h.startsWith("#")) return { r: 207, g: 175, b: 109 };
    h = h.slice(1);
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (h.length !== 6) return { r: 207, g: 175, b: 109 };
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  class GoldDust {
    constructor(host) {
      this.host = host;
      this.canvas = document.createElement("canvas");
      this.canvas.className = "cc-golddust-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
      host.prepend(this.canvas);

      this.ctx = this.canvas.getContext("2d", { alpha: true });
      this.color = parseColor(host);
      this.intensity = parseIntensity(host);

      this.base = {
        densityPer100k: 18,      // particles per 100k px² at intensity=1
        minCount: 14,
        maxCount: 110,

        baseFall: 10,
        fallVariance: 18,
        drift: 10,
        driftVariance: 14,

        sizeMin: 0.8,
        sizeMax: 2.2,
        blurMax: 2.6,

        alphaMin: 0.05,
        alphaMax: 0.18,

        mobileMaxCount: 55,
        mobileDPRCap: 1.5,
      };

      this.W = 0;
      this.H = 0;
      this.dpr = 1;
      this.particles = [];
      this.raf = null;
      this.lastT = 0;
      this.running = true;

      this.canvas.style.setProperty("--cc-golddust-opacity", String(0.55 + this.intensity * 0.35));

      this.resize = this.resize.bind(this);
      this.draw = this.draw.bind(this);
      this.onVisibility = this.onVisibility.bind(this);

      this.ro = new ResizeObserver(this.resize);
      this.ro.observe(this.host);

      document.addEventListener("visibilitychange", this.onVisibility, { passive: true });
      window.addEventListener("orientationchange", this.resize, { passive: true });

      this.resize();
      this.raf = requestAnimationFrame(this.draw);
    }

    isMobile() {
      return matchMedia("(max-width: 820px)").matches;
    }

    pickCount() {
      const area = this.W * this.H;
      const density = this.base.densityPer100k * this.intensity;
      const baseCount = Math.round((area / 100000) * density);
      let count = clamp(baseCount, this.base.minCount, this.base.maxCount);
      if (this.isMobile()) count = Math.min(count, this.base.mobileMaxCount);
      return count;
    }

    makeParticle(randomY = false) {
      const size = rand(this.base.sizeMin, this.base.sizeMax);
      const alpha = rand(this.base.alphaMin, this.base.alphaMax) * (0.95 + this.intensity * 1.15);

      const vy = rand(this.base.baseFall, this.base.baseFall + this.base.fallVariance) * (0.65 + this.intensity * 0.55);
      const vx = rand(
        -(this.base.drift + this.base.driftVariance),
        (this.base.drift + this.base.driftVariance)
      ) * (0.55 + this.intensity * 0.55);

      const blur = rand(0, this.base.blurMax) * (0.6 + this.intensity * 0.7);

      return {
        x: rand(0, this.W),
        y: randomY ? rand(0, this.H) : -rand(10, this.H * 0.2),
        r: size,
        a: alpha,
        vx, vy,
        blur,
        tw: rand(0.6, 1.4),
        ph: rand(0, Math.PI * 2),
      };
    }

    resize() {
      const rect = this.host.getBoundingClientRect();
      this.W = Math.max(1, Math.floor(rect.width));
      this.H = Math.max(1, Math.floor(rect.height));

      const rawDpr = window.devicePixelRatio || 1;
      this.dpr = this.isMobile() ? Math.min(rawDpr, this.base.mobileDPRCap) : rawDpr;

      this.canvas.width = Math.floor(this.W * this.dpr);
      this.canvas.height = Math.floor(this.H * this.dpr);
      this.canvas.style.width = this.W + "px";
      this.canvas.style.height = this.H + "px";

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.particles = [];
      const count = this.pickCount();
      for (let i = 0; i < count; i++) this.particles.push(this.makeParticle(true));
    }

    onVisibility() {
      this.running = document.visibilityState === "visible";
      if (this.running) {
        this.lastT = 0;
        if (!this.raf) this.raf = requestAnimationFrame(this.draw);
      } else {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    }

    draw(t) {
      if (!this.running) return;
      this.raf = requestAnimationFrame(this.draw);

      const dt = this.lastT ? Math.min(0.05, (t - this.lastT) / 1000) : 0.016;
      this.lastT = t;

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);

      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.y - p.r > this.H + 12) {
          const np = this.makeParticle(false);
          Object.assign(p, np);
        }
        if (p.x < -20) p.x = this.W + 20;
        if (p.x > this.W + 20) p.x = -20;

        const twinkle = 0.85 + 0.15 * Math.sin((t / 1000) * p.tw + p.ph);
        const a = p.a * twinkle;

        ctx.save();
        ctx.shadowBlur = p.blur;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${a})`;
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    destroy() {
      try { this.ro?.disconnect(); } catch {}
      document.removeEventListener("visibilitychange", this.onVisibility);
      window.removeEventListener("orientationchange", this.resize);
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
      this.canvas?.remove();
    }
  }

  // Boot: find all hosts
  const hosts = Array.from(document.querySelectorAll('[cc-ambient="gold-dust"]'));
  if (!hosts.length) return;

  for (const host of hosts) {
    if (host.__ccGoldDust) continue;
    host.__ccGoldDust = new GoldDust(host);
  }
})();