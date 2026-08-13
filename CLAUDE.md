# CLAUDE.md — wolkenaut.github.io

Personal portfolio site for James Collier. Static site built with Eleventy (11ty),
deployed to GitHub Pages via GitHub Actions.

## Non-negotiables

- **Verify before committing.** Run `npm run build` and confirm `_site/` output is
  correct before any commit. Never commit a scaffold that has not been built at
  least once.
- **No Git LFS.** GitHub Pages does not serve LFS files — visitors receive pointer
  text instead of images. All images are committed directly as normal files.
- **No CDN dependencies for fonts or CSS.** Fonts are self-hosted via `@fontsource`
  packages. This is a privacy and performance decision, not a preference.
- **Ask before changing design tokens.** The palette and type scale in
  `src/assets/css/tokens.css` were chosen deliberately. Propose changes; do not
  make them unilaterally.
- **Respect `prefers-reduced-motion`.** Every animation and scroll behaviour must
  be wrapped in a reduced-motion guard.

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Site generator | Eleventy v3.x | Requires Node 18+; repo targets Node 22 LTS |
| Templating | Nunjucks (`.njk`) | Markdown for writings |
| Math rendering | KaTeX, build-time | Server-rendered — no client-side math JS |
| Images | `@11ty/eleventy-img` | Responsive `srcset`, WebP + fallback |
| Deploy | GitHub Actions → Pages | Pages source must be set to "GitHub Actions" |

**On the KaTeX markdown plugin:** the package ecosystem here has churned. Use
`@vscode/markdown-it-katex` as the default choice, but verify it installs and
renders correctly with the current Eleventy version before committing. If it is
unmaintained or broken, find the current maintained equivalent and note the
substitution in the commit message. Do not silently swap in MathJax — KaTeX was
chosen for build-time rendering speed and SEO.

## Directory layout

```
.
├── eleventy.config.js
├── package.json
├── .github/workflows/deploy.yml
├── .gitignore                 # node_modules, _site
└── src/
    ├── _data/
    │   └── site.json          # name, email, tagline, nav, external links
    ├── _includes/
    │   ├── layouts/
    │   │   ├── base.njk
    │   │   ├── page.njk
    │   │   └── writing.njk
    │   └── partials/
    │       ├── header.njk
    │       ├── footer.njk
    │       ├── hero-checkerboard.njk   # CSS two-tone checkerboard
    │       └── project-card.njk
    ├── assets/
    │   ├── css/
    │   │   ├── tokens.css     # design tokens — see rules above
    │   │   ├── base.css       # reset, typography, focus states
    │   │   ├── layout.css     # grid, section rhythm, containers
    │   │   └── components.css # cards, nav, gallery, footer
    │   ├── js/
    │   │   ├── nav.js         # active-section highlighting, mobile menu
    │   │   └── reveal.js      # IntersectionObserver fade-ins
    │   └── img/
    │       ├── hero/
    │       ├── math/
    │       ├── astro/
    │       └── hobbies/
    ├── index.njk              # landing page (scrolling overview)
    ├── mathematics.njk
    ├── astronomy.njk
    ├── hobbies.njk
    └── writings/
        ├── writings.json      # collection defaults
        └── *.md               # individual essays
```

Eleventy input is `src/`, output is `_site/`.

## Conventions

- **Content lives in data or Markdown, never hardcoded in templates.** Project
  entries, gallery items, and course lists go in `src/_data/` as JSON so they can
  be edited without touching markup.
- **Every page gets a `title` and `description`** in front matter. These feed
  `<title>` and `<meta name="description">`.
- **Images** always go through the `@11ty/eleventy-img` shortcode, never a raw
  `<img>` tag. Every image needs meaningful `alt` text — for astrophotography,
  describe the object, not "a photo of space".
- **Semantic HTML.** `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`.
  Heading levels descend without skipping.
- **Accessibility floor:** visible keyboard focus rings, 4.5:1 contrast minimum on
  body text, mobile-responsive down to 360px.

## Placeholder policy

Real images are not yet available. Use labelled placeholder blocks — a taupe
surface panel with the intended dimensions and a mono-type caption naming what
belongs there (e.g. `hero/portrait.jpg — 1200×1600`). Do **not** hotlink anything
from `lh3.googleusercontent.com`; those URLs are tied to Google Sites and will
expire.

## Commands

```bash
npm install
npm run serve    # local dev at localhost:8080 with hot reload
npm run build    # production build into _site/
```
