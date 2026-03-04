/* cc-anims v1.0.0 - sibling module loader */
(function () {
  "use strict";

  const cfg = window.CCAnims || {};

  if (window.__CC_ANIMS_INIT__) return;
  window.__CC_ANIMS_INIT__ = true;

  const thisSrc = (document.currentScript && document.currentScript.src) || "";
  const root = thisSrc.includes("/cc-anims/")
    ? thisSrc.split("/cc-anims/")[0]
    : "";

  const cdnRoot = cfg.cdnRoot || root;

  window.__CC_ANIMS_LOADED__ = window.__CC_ANIMS_LOADED__ || { css: {}, js: {} };

  function loadCSS(href, key) {
    const k = key || href;
    if (window.__CC_ANIMS_LOADED__.css[k]) return;
    window.__CC_ANIMS_LOADED__.css[k] = true;

    const el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = href;
    document.head.appendChild(el);
  }

  function loadJS(src, key) {
    const k = key || src;
    if (window.__CC_ANIMS_LOADED__.js[k]) return;
    window.__CC_ANIMS_LOADED__.js[k] = true;

    const el = document.createElement("script");
    el.src = src;
    el.defer = true;
    document.head.appendChild(el);
  }

  function isEnabled(val) {
    if (val === true) return true;
    if (!val) return false;
    if (typeof val === "object" && val.enabled === true) return true;
    return false;
  }

  function getVersion(val) {
    if (typeof val === "object" && val.version) return String(val.version);
    return "stable";
  }

  function moduleBase(name, version) {
    return `${cdnRoot}/${name}/${version}/`;
  }

  if (isEnabled(cfg.reveal)) {
    const v = getVersion(cfg.reveal);
    const base = moduleBase("cc-reveal", v);
    loadCSS(base + "cc-reveal.css", `cc-reveal:${v}:css`);
    loadJS(base + "cc-reveal.js", `cc-reveal:${v}:js`);
  }

  if (isEnabled(cfg.goldust)) {
    const v = getVersion(cfg.goldust);
    const base = moduleBase("cc-goldust", v);
    loadCSS(base + "cc-goldust.css", `cc-goldust:${v}:css`);
    loadJS(base + "cc-goldust.js", `cc-goldust:${v}:js`);
  }


})();