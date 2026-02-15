/* ccui-core.js v1.0.0
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

})(window);
