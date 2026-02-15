/* cc-reveal.js v1.0.0
   Adds .is-visible to .reveal elements when they enter viewport.
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

  // Fallback: reveal everything
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-visible"));
    document.documentElement.classList.add("ccreveal-ready");
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.14, rootMargin: "0px 0px -10% 0px" });

  els.forEach(el => io.observe(el));
  document.documentElement.classList.add("ccreveal-ready");
})();
