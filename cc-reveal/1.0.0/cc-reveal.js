/* cc-reveal.js v1.0.1
   Adds .is-visible to .reveal elements when they enter viewport.
   Optional per-element config via data-* attributes:
   - data-duration="900"   (ms)
   - data-delay="120"      (ms)
   - data-distance="24"    (px)
   - data-ease="cubic-bezier(.2,.8,.2,1)" (string)
*/
(function () {
  "use strict";

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const els = document.querySelectorAll(".reveal");
  if (!els.length) {
    document.documentElement.classList.add("ccreveal-ready");
    return;
  }

   // ---------- helpers: number parsing/formatting ----------
  function parseNumberParts(rawText) {
    const text = (rawText || "").trim();

    // Find first "number-like" chunk (supports 1,234.56 or 1.234,56)
    const match = text.match(/[-+]?\d[\d.,]*/);
    if (!match) return null;

    const numStr = match[0];
    const startIdx = match.index;
    const endIdx = startIdx + numStr.length;

    const prefix = text.slice(0, startIdx);
    const suffix = text.slice(endIdx);

    // Determine decimal separator (last occurrence of '.' or ',')
    const lastDot = numStr.lastIndexOf(".");
    const lastComma = numStr.lastIndexOf(",");

    let decimalSep = null;
    if (lastDot > -1 || lastComma > -1) {
      decimalSep = lastDot > lastComma ? "." : ",";
    }

    let decimals = 0;
    if (decimalSep) {
      const decPart = numStr.split(decimalSep)[1] || "";
      decimals = decPart.length;
    }

    // Normalize to JS float:
    // - Remove thousands separators
    // - Convert decimal sep to '.'
    let normalized = numStr;

    if (decimalSep === ",") {
      // 12.345,67 -> remove '.' thousands, replace ',' decimal
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if (decimalSep === ".") {
      // 12,345.67 -> remove ',' thousands
      normalized = normalized.replace(/,/g, "");
    } else {
      // No obvious decimal sep, remove separators
      normalized = normalized.replace(/[.,]/g, "");
    }

    const value = Number(normalized);
    if (!Number.isFinite(value)) return null;

    return { prefix, suffix, decimals, decimalSep, value };
  }

  function formatNumber(value, decimals, decimalSep) {
    // fixed decimals
    let s = value.toFixed(decimals);

    // add thousands separators + decimal separator style to match original
    // We'll format using en-US commas for thousands then swap if needed.
    const parts = s.split(".");
    let intPart = parts[0];
    const decPart = parts[1] || "";

    // thousands with comma
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (decimals === 0) return intPart;

    if (decimalSep === ",") {
      // swap thousands commas -> dots, decimal dot -> comma
      intPart = intPart.replace(/,/g, ".");
      return intPart + "," + decPart;
    }

    // decimalSep '.' or unknown -> keep standard
    return intPart + "." + decPart;
  }

  function animateCount(el) {
    // Only if data-from exists OR element has data-count (opt-in)
    if (!("from" in el.dataset) && !("count" in el.dataset)) return;

    const parts = parseNumberParts(el.textContent);
    if (!parts) return;

    const fromRaw = el.dataset.from;
    const from = fromRaw != null && fromRaw !== "" ? Number(fromRaw) : 0;
    const to = parts.value;

    // If reduced motion, set final immediately
     console.log(fromRaw)
    if (reduce) {
       console.log(el+"is reduced")
      el.textContent = `${parts.prefix}${formatNumber(to, parts.decimals, parts.decimalSep)}${parts.suffix}`;
      return;
    }

    const dur = Number(el.dataset.countDuration || 1200);
    const start = performance.now();

    // Guard: prevent double-running
    if (el.dataset.countRan === "1") return;
    el.dataset.countRan = "1";

    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;

      el.textContent =
        `${parts.prefix}${formatNumber(current, parts.decimals, parts.decimalSep)}${parts.suffix}`;

      if (t < 1) requestAnimationFrame(tick);
      else {
        // ensure exact final value
        el.textContent =
          `${parts.prefix}${formatNumber(to, parts.decimals, parts.decimalSep)}${parts.suffix}`;
      }
    }

    requestAnimationFrame(tick);
  }
  // Apply per-element overrides via data-attributes (before observing)
  els.forEach((el) => {
    const { duration, delay, distance, ease } = el.dataset;

    if (duration) el.style.setProperty("--reveal-duration", `${duration}ms`);
    if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
    if (distance) el.style.setProperty("--reveal-distance", `${distance}px`);
    if (ease) el.style.setProperty("--reveal-ease", ease);
  });

  // Fallback: reveal everything
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    document.documentElement.classList.add("ccreveal-ready");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
  );

  els.forEach((el) => io.observe(el));
  document.documentElement.classList.add("ccreveal-ready");
})();
