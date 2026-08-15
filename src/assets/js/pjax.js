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
  let loadedPathname = window.location.pathname;

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

    document.title = doc.title;

    const newDesc = doc.querySelector('meta[name="description"]');
    const curDesc = document.querySelector('meta[name="description"]');
    if (newDesc && curDesc) curDesc.setAttribute("content", newDesc.getAttribute("content") || "");

    main.innerHTML = newMain.innerHTML;
    updateActiveNavForUrl(url.pathname);
    loadedPathname = url.pathname;

    // Must happen before SitePanels.init() below: it decides which panel to
    // show by reading location.hash, which only reflects the target URL
    // once pushState has actually updated it. Read too early and it sees
    // the *previous* page's hash and defaults to "home" every time.
    if (push) {
      window.history.pushState({ pjax: true }, "", url.href);
    }

    // SitePanels.init() only finds panels (and handles its own scroll/focus)
    // when the fetched page is the index — for a plain page like a writing,
    // it's a no-op and we fall back to a straightforward scroll + focus here.
    const hasPanels = !!(window.SitePanels && window.SitePanels.init());

    if (!hasPanels) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      main.focus({ preventScroll: true });
      if (window.SiteReveal) window.SiteReveal.init();
    }
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
    // Back/forward between panel hashes (e.g. #mathematics <-> #astronomy)
    // fires popstate AND hashchange for the same traversal — panels.js's own
    // hashchange listener already resyncs instantly with no network
    // involved. Only fall through to a real fetch+swap when the pathname
    // itself changed (e.g. returning here from a standalone writing page).
    const url = new URL(window.location.href);
    if (url.pathname === loadedPathname) return;
    swapContent(url, false);
  });
})();
