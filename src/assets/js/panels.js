(function () {
  const PANEL_NAMES = ["home", "mathematics", "astronomy", "interests", "writings"];
  const TITLES = {
    home: null, // null = use the page's own <title>, set at build time
    mathematics: "Mathematics",
    astronomy: "Astronomy",
    interests: "Interests",
    writings: "Writings",
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
    if (!panels.length) return false;

    const active = panelNameFromHash();
    let activeEl = null;

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === active;
      panel.hidden = !isActive;
      if (isActive) activeEl = panel;
    });

    document.querySelectorAll("[data-panel-link]").forEach((link) => {
      if (link.dataset.panelLink === active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.title = (TITLES[active] || "Home") + titleSuffix;

    // Two-arg scrollTo still honors CSS scroll-behavior: smooth, which would
    // race against the focus() call below (each triggers its own scroll) —
    // force both to resolve instantly instead.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const main = document.getElementById("main");
    if (main) main.focus({ preventScroll: true });

    if (window.SiteReveal) window.SiteReveal.init(activeEl);

    return true;
  }

  window.SitePanels = { init: applyActivePanel };
  window.addEventListener("hashchange", applyActivePanel);
  applyActivePanel();
})();
