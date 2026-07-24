/*************************************************************
 * TAX-GENIE LOADER (PROD – WORKING THEME TOGGLE)
 *************************************************************/
(function (Drupal, drupalSettings, once) {
  "use strict";

  const HOST = "https://www.incometax.gov.in";
  const TG_ROOT = HOST + "/iec/taxgenie/";
  const MAP_URL = TG_ROOT + "chunk/map.json";

  /* ---------------------------------------------------------
   * Force apply theme to tax-genie (authoritative)
   * --------------------------------------------------------- */
  function forceTheme(theme) {
    const tg = document.getElementById("tax-genie-host");
    if (!tg) return;

    tg.removeAttribute("theme-control");
    tg.setAttribute("theme-control", theme);
  }

  /* ---------------------------------------------------------
   * Toggle theme based on current value
   * --------------------------------------------------------- */
  function toggleTaxGenieTheme() {
    const tg = document.getElementById("tax-genie-host");
    if (!tg) return;

    const current = tg.getAttribute("theme-control") || "light";
    const next = current === "dark" ? "light" : "dark";

    forceTheme(next);
    setTimeout(() => forceTheme(next), 100);
    setTimeout(() => forceTheme(next), 300);
  }

  /* ---------------------------------------------------------
   * Bind Foportal contrast icon
   * --------------------------------------------------------- */
  function bindContrastIcon() {
    const btn = document.getElementById("colorcontrasting");
    if (!btn) return;

    btn.addEventListener(
      "click",
      () => {
        toggleTaxGenieTheme();
      },
      true   // capture phase – unchanged logic
    );
  }

  /* ---------------------------------------------------------
   * Load JS chunk
   * --------------------------------------------------------- */
  function loadScript(url, isModule) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      if (isModule) s.type = "module";
      s.onload = () => resolve(url);
      s.onerror = () => reject("Failed to load: " + url);
      document.head.appendChild(s);
    });
  }

  /* ---------------------------------------------------------
   * Mount chatbot
   * --------------------------------------------------------- */
  function mountChatbot() {
    customElements.whenDefined("tax-genie").then(() => {

      let el = document.getElementById("tax-genie-host");
      if (!el) {
        el = document.createElement("tax-genie");
        el.id = "tax-genie-host";
        el.setAttribute("translation-lang", "en");
        el.setAttribute("deployurl", TG_ROOT);
        el.setAttribute("theme-control", "light"); // default

        document.body.appendChild(el);
      }

      bindContrastIcon();
    });
  }

  /* ---------------------------------------------------------
   * Drupal behavior
   * --------------------------------------------------------- */
  Drupal.behaviors.taxGenieLoader = {
    attach: function (context) {
      once("taxGenieLoader", "html", context).forEach(() => {

        fetch(MAP_URL)
          .then(r => r.json())
          .then(map => {

            let seq = Promise.resolve();

            (map.exposedChunks || []).forEach(chunk => {
              const fullUrl = TG_ROOT + chunk;
              const isModule = chunk.startsWith("tax-genie");
              seq = seq.then(() => loadScript(fullUrl, isModule));
            });

            return seq;
          })
          .then(() => mountChatbot())
          .catch(err => console.error(err));
      });
    }
  };

})(Drupal, drupalSettings, once);