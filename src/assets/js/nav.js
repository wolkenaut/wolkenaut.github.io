(function () {
  const sections = document.querySelectorAll("[data-nav-section]");
  const navLinks = document.querySelectorAll(".site-nav a");
  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

  const setActive = (href) => {
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === href) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.dataset.navSection);
        }
      });
    },
    { rootMargin: "-40% 0px -40% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
})();
