(function () {
  console.log("entrou na func")
  const cfg = window.CCAnims || {};
  const thisSrc = document.currentScript.src;
  const root = thisSrc.split("/cc-anims/")[0];

  const loaded = {};

  function loadCSS(href){
    if(loaded[href]) return;
    loaded[href] = true;

    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }

  function loadJS(src){
    if(loaded[src]) return;
    loaded[src] = true;

    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }

  Object.keys(cfg).forEach(function(module){

    const enabled = cfg[module];

    if(!enabled) return;
    if(module === "cdnRoot") return;

    const version =
      typeof enabled === "object" && enabled.version
        ? enabled.version
        : "stable";

    const base = `${root}/cc-${module}/${version}/`;

    loadCSS(base + `cc-${module}.css`);
    loadJS(base + `cc-${module}.js`);

  });

})();
