/* ccui-slider.js v1.0.0
   Lightweight slider for simple image/content slideshows.
   Markup:
     <div class="cc-slider" data-slider data-interval="4500">
       <div class="cc-track">
         <div class="cc-slide">...</div>
       </div>
       <button class="cc-prev" type="button">‹</button>
       <button class="cc-next" type="button">›</button>
     </div>
*/
(function (global) {
  "use strict";

  const CCUI = global.CCUI;
  if (!CCUI) return;

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function initSlider(root, opts = {}) {
    const track = root.querySelector(".cc-track");
    const slides = Array.from(root.querySelectorAll(".cc-slide"));
    if (!track || slides.length < 2) return;

    const btnPrev = root.querySelector(".cc-prev");
    const btnNext = root.querySelector(".cc-next");

    const intervalMs = Number(root.getAttribute("data-interval") || opts.interval || 5000);
    const autoplay = (root.getAttribute("data-autoplay") ?? "true") !== "false";
    const loop = (root.getAttribute("data-loop") ?? "true") !== "false";

    let index = 0;
    let timer = null;
    let startX = null;

    // Set widths
    track.style.display = "flex";
    track.style.transition = "transform 420ms cubic-bezier(.2,.8,.2,1)";
    slides.forEach(s => { s.style.flex = "0 0 100%"; });

    function render() {
      track.style.transform = `translateX(${-index * 100}%)`;
      root.setAttribute("data-index", String(index));
    }

    function next() {
      if (index === slides.length - 1) {
        if (loop) index = 0;
      } else {
        index += 1;
      }
      render();
    }

    function prev() {
      if (index === 0) {
        if (loop) index = slides.length - 1;
      } else {
        index -= 1;
      }
      render();
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function start() {
      if (!autoplay || CCUI.prefersReducedMotion()) return;
      stop();
      timer = setInterval(next, intervalMs);
    }

    // Buttons
    if (btnNext) btnNext.addEventListener("click", () => { stop(); next(); start(); });
    if (btnPrev) btnPrev.addEventListener("click", () => { stop(); prev(); start(); });

    // Pause on hover/focus
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    // Touch swipe (basic)
    root.addEventListener("touchstart", (e) => {
      startX = e.touches[0]?.clientX ?? null;
    }, { passive: true });

    root.addEventListener("touchend", (e) => {
      if (startX == null) return;
      const endX = e.changedTouches[0]?.clientX ?? startX;
      const dx = endX - startX;
      startX = null;

      if (Math.abs(dx) < 40) return; // swipe threshold
      stop();
      if (dx < 0) next();
      else prev();
      start();
    });

    // Init
    index = clamp(index, 0, slides.length - 1);
    render();
    start();

    return { next, prev, stop, start };
  }

  function initAllSliders(options = {}) {
    const roots = CCUI.qsa("[data-slider]");
    roots.forEach(r => initSlider(r, options));
  }

  CCUI.slider = { init: initSlider, initAll: initAllSliders };
  CCUI.onReady(() => initAllSliders());

})(window);
