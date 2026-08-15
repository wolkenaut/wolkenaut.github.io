(function () {
  let observer;

  // `root` scopes which .reveal elements get (re)observed — defaults to the
  // whole document, but panels.js passes just the panel that became active
  // so switching tabs can't leave a previous panel's observer entries
  // dangling or waste work re-scanning content that's still hidden.
  function initReveal(root) {
    if (observer) observer.disconnect();

    const scope = root || document;
    const els = scope.querySelectorAll(".reveal:not(.is-visible)");
    if (!els.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => observer.observe(el));
  }

  window.SiteReveal = { init: initReveal };
  initReveal();
})();
