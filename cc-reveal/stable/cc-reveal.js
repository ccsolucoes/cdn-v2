/* cc-reveal v2.0.0 */
(function () {
  "use strict";

  const DEFAULTS = {
    type: "fade-up",
    once: true,
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px",
    duration: 650,
    delay: 0,
    ease: "cubic-bezier(.2,.8,.2,1)",
    distance: 18,
    debug: false
  };

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toBool = (v, fallback) => {
    if (v === null || v === undefined || v === "") return fallback;
    if (v === "true") return true;
    if (v === "false") return false;
    return fallback;
  };

  const toNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  function applyVars(el, opts) {
    el.style.setProperty("--cc-reveal-duration", `${opts.duration}ms`);
    el.style.setProperty("--cc-reveal-delay", `${opts.delay}ms`);
    el.style.setProperty("--cc-reveal-ease", opts.ease);
    el.style.setProperty("--cc-reveal-distance", `${opts.distance}px`);
  }

  function normalizeType(el) {
    // v1 compatibility: if using .cc-reveal but no data type, keep default
    if (!el.getAttribute("data-cc-reveal")) {
      el.setAttribute("data-cc-reveal", DEFAULTS.type);
    }
  }

  function parseOptions(el) {
    const type = el.getAttribute("data-cc-reveal") || DEFAULTS.type;
    const once = toBool(el.getAttribute("data-cc-once"), DEFAULTS.once);
    const threshold = toNum(el.getAttribute("data-cc-threshold"), DEFAULTS.threshold);
    const duration = toNum(el.getAttribute("data-cc-duration"), DEFAULTS.duration);
    const delay = toNum(el.getAttribute("data-cc-delay"), DEFAULTS.delay);
    const ease = el.getAttribute("data-cc-ease") || DEFAULTS.ease;
    const distance = toNum(el.getAttribute("data-cc-distance"), DEFAULTS.distance);
    const debug = toBool(el.getAttribute("data-cc-debug"), DEFAULTS.debug);

    return { type, once, threshold, duration, delay, ease, distance, debug };
  }

  function reveal(el) {
    el.classList.add("cc-reveal--in");
  }

  function hide(el) {
    el.classList.remove("cc-reveal--in");
  }

  function collectTargets(root = document) {
    const v2 = Array.from(root.querySelectorAll("[data-cc-reveal]"));
    const v1 = Array.from(root.querySelectorAll(".cc-reveal"));
    const all = new Set([...v2, ...v1]);
    return Array.from(all);
  }

  function setupStaggers(root = document) {
    const containers = Array.from(root.querySelectorAll("[data-cc-stagger]"));
    for (const c of containers) {
      const baseStagger = toNum(c.getAttribute("data-cc-stagger"), 0);
      if (!baseStagger) continue;

      const selector = c.getAttribute("data-cc-children") || "> *";
      let kids = [];
      try {
        kids = Array.from(c.querySelectorAll(selector));
      } catch {
        kids = Array.from(c.children);
      }

      kids.forEach((child, idx) => {
        // Only apply if child participates in reveal
        if (!child.matches("[data-cc-reveal], .cc-reveal")) return;

        const existing = child.getAttribute("data-cc-delay");
        const base = existing ? toNum(existing, 0) : 0;
        child.setAttribute("data-cc-delay", String(base + idx * baseStagger));
      });
    }
  }

  function init(root = document) {
    setupStaggers(root);

    const targets = collectTargets(root);

    for (const el of targets) {
      normalizeType(el);

      const opts = parseOptions(el);

      // Set type explicitly to avoid “unknown defaults” issues
      el.setAttribute("data-cc-reveal", opts.type);

      // Debug outline
      if (opts.debug) el.classList.add("cc-reveal--debug");

      // Reduced motion: reveal immediately
      if (prefersReducedMotion()) {
        applyVars(el, { ...opts, duration: 1, delay: 0, distance: 0 });
        reveal(el);
        continue;
      }

      applyVars(el, opts);
    }

    // Group by threshold for fewer observers (simple batching)
    const buckets = new Map();
    for (const el of targets) {
      const opts = parseOptions(el);
      const key = String(opts.threshold);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(el);
    }

    for (const [key, els] of buckets.entries()) {
      const threshold = Number(key);

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target;
            const opts = parseOptions(el);

            if (entry.isIntersecting) {
              reveal(el);
              if (opts.once) io.unobserve(el);
            } else {
              if (!opts.once) hide(el);
            }
          }
        },
        { threshold, rootMargin: DEFAULTS.rootMargin }
      );

      els.forEach((el) => io.observe(el));
    }
  }

  // Public hook
  window.CC = window.CC || {};
  window.CC.reveal = {
    init
  };

  // Auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(document));
  } else {
    init(document);
  }
})();