(function () {
  if (!window.fetch || !window.history || !window.history.pushState || !window.DOMParser) return;

  const main = document.getElementById("main");
  if (!main) return;

  function sameOrigin(url) {
    return url.origin === window.location.origin;
  }

  function isPjaxable(link) {
    if (!link || !link.href) return false;
    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (e) {
      return false;
    }
    if (!sameOrigin(url)) return false;
    if (link.hasAttribute("download")) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("data-no-pjax")) return false;
    // Skip non-page assets (images, PDFs, etc) — only follow extensionless
    // routes and .html, which is all this site ever links to internally.
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !/\.html$/i.test(url.pathname)) return false;
    return true;
  }

  function updateActiveNavForUrl(pathname) {
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname;
      if (linkPath === pathname) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  let inFlight = 0;

  async function swapContent(url, push) {
    const requestId = ++inFlight;

    let html;
    try {
      const res = await fetch(url.href, { headers: { "X-Requested-With": "pjax" } });
      if (!res.ok) throw new Error("Bad response: " + res.status);
      html = await res.text();
    } catch (e) {
      window.location.href = url.href;
      return;
    }

    // A newer navigation started while this fetch was in flight — drop this
    // one so responses can't land out of order.
    if (requestId !== inFlight) return;

    const doc = new DOMParser().parseFromString(html, "text/html");
    const newMain = doc.getElementById("main");
    if (!newMain) {
      window.location.href = url.href;
      return;
    }

    const applySwap = () => {
      document.title = doc.title;

      const newDesc = doc.querySelector('meta[name="description"]');
      const curDesc = document.querySelector('meta[name="description"]');
      if (newDesc && curDesc) curDesc.setAttribute("content", newDesc.getAttribute("content") || "");

      main.innerHTML = newMain.innerHTML;
      updateActiveNavForUrl(url.pathname);

      if (window.SitePanels) window.SitePanels.init();
      if (window.SiteReveal) window.SiteReveal.init();
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && document.startViewTransition) {
      // The transition can be aborted for reasons outside our control (a
      // second one starting before the first settles, a browser declining
      // to run it) — the update callback still runs either way, so the
      // content swap itself is unaffected. Swallow rejections on every
      // promise the transition exposes rather than letting them surface as
      // unhandled rejections.
      const transition = document.startViewTransition(applySwap);
      Promise.resolve(transition.ready).catch(() => {});
      Promise.resolve(transition.updateCallbackDone).catch(() => {});
      Promise.resolve(transition.finished).catch(() => {});
    } else {
      applySwap();
    }

    if (push) {
      window.history.pushState({ pjax: true }, "", url.href);
    }

    if (url.hash) {
      const target = document.getElementById(url.hash.slice(1));
      if (target) target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }

    // Move focus to the new content so keyboard/screen-reader users get the
    // same "landed on new content" signal a full navigation would give.
    main.focus();
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a");
    if (!isPjaxable(link)) return;

    const url = new URL(link.href, window.location.href);

    // Same-page hash link — let the browser do its native anchor jump.
    if (url.pathname === window.location.pathname && url.hash) return;

    event.preventDefault();
    swapContent(url, true);
  });

  window.addEventListener("popstate", () => {
    swapContent(new URL(window.location.href), false);
  });
})();
