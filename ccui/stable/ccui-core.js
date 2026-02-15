/* ccui-core.js v1.1.0
   Tiny helpers + ready hook + reduced motion helper
*/
(function (global) {
  "use strict";

  const CCUI = global.CCUI || (global.CCUI = {});

  CCUI.qs = (sel, root = document) => root.querySelector(sel);
  CCUI.qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  CCUI.onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  CCUI.prefersReducedMotion = () =>
    !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);


  // Minimal mobile nav controller for cc-layout.css
  // Markup expectation:
  // <nav class="cc-nav">
  //   <button class="cc-nav-toggle" aria-expanded="false" aria-controls="cc-nav-drawer-1">Menu</button>
  //   <div class="cc-nav-drawer" id="cc-nav-drawer-1" hidden>...</div>
  // </nav>
  // <div class="cc-nav-overlay" hidden></div>
  CCUI.initNav = (root = document) => {
    const navs = CCUI.qsa(".cc-nav", root);

    navs.forEach((nav, idx) => {
      const toggle = CCUI.qs(".cc-nav-toggle", nav);
      const drawer = CCUI.qs(".cc-nav-drawer", nav);

      if (!toggle || !drawer) return;

      // Ensure IDs for aria-controls
      if (!drawer.id) drawer.id = `cc-nav-drawer-${idx + 1}`;
      toggle.setAttribute("aria-controls", drawer.id);

      // Find or create overlay sibling after nav
      let overlay = nav.nextElementSibling;
      if (!overlay || !overlay.classList || !overlay.classList.contains("cc-nav-overlay")) {
        overlay = document.createElement("div");
        overlay.className = "cc-nav-overlay";
        overlay.hidden = true;
        nav.insertAdjacentElement("afterend", overlay);
      }

      const setOpen = (open) => {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        drawer.hidden = !open;
        overlay.hidden = !open;

        // Lock scroll while open (simple, reversible)
        document.documentElement.style.overflow = open ? "hidden" : "";
      };

      // Initial state
      drawer.hidden = true;
      overlay.hidden = true;
      toggle.setAttribute("aria-expanded", "false");

      toggle.addEventListener("click", () => {
        const open = !nav.classList.contains("is-open");
        setOpen(open);
      });

      // Close on overlay click
      overlay.addEventListener("click", () => setOpen(false));

      // Close on ESC
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("is-open")) setOpen(false);
      });

      // Close when a drawer link is clicked
      drawer.addEventListener("click", (e) => {
        const a = e.target && e.target.closest ? e.target.closest("a") : null;
        if (a) setOpen(false);
      });
    });
  };



  CCUI.onReady(() => {
    try { CCUI.initNav(); } catch (e) {}
  });

})(window);
