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
  const titleSuffix = initialTitle.includes(" - ")
    ? initialTitle.slice(initialTitle.indexOf(" - "))
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

  // Clicking a nav link to the panel that's already active doesn't change
  // location.hash, so hashchange never fires and applyActivePanel's own
  // scrollTo(0,0) never runs — the browser's native "scroll the element
  // with this id into view" behavior is all that's left, and it doesn't
  // know about the sticky header sitting on top of #home, landing a bit
  // lower than a fresh load does. Handling the click ourselves in every
  // case (same panel or not) keeps the two consistent.
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("[data-panel-link], .site-title");
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (e) {
      return;
    }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;

    event.preventDefault();
    if (location.hash === url.hash) {
      applyActivePanel();
    } else {
      location.hash = url.hash;
    }
  });

  window.SitePanels = { init: applyActivePanel };
  window.addEventListener("hashchange", applyActivePanel);
  applyActivePanel();
})();
