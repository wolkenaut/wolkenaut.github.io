(function () {
  const PANEL_NAMES = ["home", "mathematics", "astronomy", "interests"];
  const TITLES = {
    home: null, // null = use the page's own <title>, set at build time
    mathematics: "Mathematics",
    astronomy: "Astronomy",
    interests: "Interests",
  };

  // Captured once, before any panel switch can mutate document.title, so
  // repeated switches always derive from the original server-rendered title
  // rather than compounding on top of a previous rewrite.
  const initialTitle = document.title;
  const titleSuffix = initialTitle.includes(" — ")
    ? initialTitle.slice(initialTitle.indexOf(" — "))
    : "";

  function panelNameFromHash() {
    const name = location.hash.replace(/^#/, "");
    return PANEL_NAMES.includes(name) ? name : "home";
  }

  function applyActivePanel() {
    const panels = document.querySelectorAll(".topic-panel[data-panel]");
    if (!panels.length) return;

    const active = panelNameFromHash();

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== active;
    });

    document.querySelectorAll("[data-panel-link]").forEach((link) => {
      if (link.dataset.panelLink === active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.title = (TITLES[active] || "Home") + titleSuffix;

    window.scrollTo(0, 0);

    const main = document.getElementById("main");
    if (main) main.focus();

    if (window.SiteReveal) window.SiteReveal.init();
  }

  window.SitePanels = { init: applyActivePanel };
  window.addEventListener("hashchange", applyActivePanel);
  applyActivePanel();
})();
