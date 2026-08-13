# Build specification — wolkenaut.github.io

Read `CLAUDE.md` first for conventions and non-negotiables. This document is the
one-time scaffold spec: what to build, in what order, with what content.

Build in the phases below. Run `npm run build` at the end of each phase and
confirm it compiles before moving on.

---

## Design tokens

Write this file exactly as given to `src/assets/css/tokens.css`. Do not adjust
values without asking.

```css
:root {
  /* ---- Surface ---- */
  --c-bg:            #F4EFE5;  /* page background, warm cream */
  --c-bg-alt:        #EDE6D9;  /* alternating section band */
  --c-surface:       #E9E1D3;  /* cards, panels, placeholder blocks */
  --c-border:        #D6C9B4;  /* hairline rules, card edges */

  /* ---- Ink ---- */
  --c-text:          #3A322A;  /* body copy */
  --c-text-muted:    #6B6055;  /* captions, metadata, secondary */
  --c-taupe:         #8C7A63;  /* decorative lines, tiling motif */

  /* ---- Accent ---- */
  --c-accent:        #A66A4A;  /* terracotta — links, active states */
  --c-accent-hover:  #8F5738;
  /* Alternate cool accent, swap in if preferred:
     --c-accent:       #2E4057;
     --c-accent-hover: #1F2C3C; */

  /* ---- Type ---- */
  --f-display: "PT Serif", Georgia, serif;
  --f-body:    "Source Serif 4", Georgia, serif;
  --f-label:   "PT Serif", Georgia, serif;

  --fs-xs:   0.8125rem;
  --fs-sm:   0.9375rem;
  --fs-base: 1.0625rem;
  --fs-lg:   1.25rem;
  --fs-xl:   1.75rem;
  --fs-2xl:  2.5rem;
  --fs-3xl:  3.5rem;

  --lh-tight: 1.15;
  --lh-body:  1.65;

  /* ---- Space ---- */
  --sp-1: 0.5rem;  --sp-2: 1rem;   --sp-3: 1.5rem;
  --sp-4: 2.5rem;  --sp-5: 4rem;   --sp-6: 6rem;

  --measure: 68ch;        /* max line length for prose */
  --container: 1140px;
}
```

**Type roles.** PT Serif (bold, 700) on `h1`/`h2`, and again — regular weight,
uppercase, generous letter-spacing — for eyebrows, dates, course lists, image
captions, and nav (the `--f-label` role; James prefers a serif here over a
monospace or Fraunces). PT Serif only ships 400/700, no variable axis, so
don't reach for in-between weights. Source Serif 4 for all body prose. Do not
use PT Serif for body text. Wherever the rest of this document says "mono
type" or "mono beneath," read that as the `--f-label` treatment above, not an
actual monospace typeface.

**Install fonts** via `@fontsource/pt-serif` and
`@fontsource-variable/source-serif-4`. Verify the exact package names on npm —
variable font package naming differs from static.

---

## Signature element: the transparent checkerboard

Behind the landing-page hero sits a **transparent two-tone checkerboard**, built
in `src/_includes/partials/hero-checkerboard.njk`.

Requirements:

- **Pure CSS, not an image.** Use a `repeating-linear-gradient` pair or a
  `conic-gradient` tile so the pattern inherits the token colours and scales
  without assets. No SVG file, no PNG.
- **Two tones, both low-contrast:** `--c-surface` and `--c-bg-alt`, at roughly
  0.5 opacity over the page background. The pattern should read as a texture you
  notice on second glance, never as a foreground element. If the hero text is
  harder to read with it on than off, the opacity is too high.
- **Tile size** around 72px at desktop, scaling down to ~40px below 768px so it
  doesn't turn into visual noise on a phone.
- **Soft edge.** Apply a `mask-image` radial or linear fade so the checkerboard
  dissolves toward the section boundary rather than cutting off at a hard line.
- **Structured for future motion.** The pattern is static on this build, but a
  slow drift and a pointer-reactive parallax are planned. Drive tile size,
  offset, and opacity from CSS custom properties on a wrapper element, so
  animating later means updating variables rather than rewriting the component.
- `aria-hidden="true"` — decorative to a screen reader.

Do not add a gradient wash, grain overlay, or any second background treatment on
top of this. The checkerboard is the one visual signature; everything around it
stays quiet.

---

## Phase 1 — Scaffold and verify

1. `npm init`, install Eleventy v3.x, `@11ty/eleventy-img`, the KaTeX markdown
   plugin, and the three font packages.
2. `eleventy.config.js` with input `src`, output `_site`, Nunjucks templating,
   passthrough copy for `assets/`, and the markdown-it KaTeX plugin registered.
3. `package.json` scripts: `serve` and `build`.
4. `.gitignore` covering `node_modules/` and `_site/`.
5. **Run `npm run build`. Confirm it succeeds before continuing.**

## Phase 2 — Layouts, tokens, and chrome

- `tokens.css` exactly as specified above; then `base.css`, `layout.css`,
  `components.css`.
- `base.njk` — html shell, meta tags, font imports, skip-to-content link.
- `header.njk` — site title, nav (Home / Mathematics / Astronomy / Hobbies).
  Sticky on scroll with a hairline `--c-border` bottom edge. Mono type, uppercase.
- `footer.njk` — email, external links, copyright.
- `src/_data/site.json`:

```json
{
  "name": "James Collier",
  "tagline": "Mathematics | Astrophotography | Data Engineering",
  "email": "james.collier@aya.yale.edu",
  "url": "https://wolkenaut.github.io",
  "links": []
}
```

The `links` array is intentionally empty — external profiles are still TBD.

## Phase 3 — Landing page (`index.njk`)

Single scrolling page, anchor navigation, five sections:

1. **Hero** — name in PT Serif at `--fs-3xl`, tagline in mono beneath,
   transparent checkerboard behind. Full viewport height.
2. **About** — the bio text below, set at `--measure` width.
3. **Three section cards** — Mathematics, Astronomy, Hobbies. Each a `--c-surface`
   panel with a one-line summary and a link through to the full page. This is the
   hinge of the hybrid architecture: overview here, depth on the dedicated pages.
4. **Contact** — email, link placeholders.

**Bio copy** (verbatim from the existing site):

> Hello! My name is James Collier and I am a Yale alum who graduated in 2026. I am
> studying mathematics, but I am also passionate about astronomy, physics,
> statistics, and linguistics. I've been an astrophotographer, an astronomy
> teacher, and currently do work in data engineering.

**Scroll behaviour:** `scroll-behavior: smooth` on the root for anchor jumps.
`reveal.js` uses IntersectionObserver to fade and translate sections in as they
enter the viewport — subtle, roughly 400ms, 12px of travel. Nav highlights the
active section. All of it disabled under `prefers-reduced-motion`.

## Phase 4 — Mathematics page

Content sections in order:

**Projects** (each a card: title, advisor, term, description)

1. **Hyperbolic Knots and the Volume Conjecture** — Independent study under Ka Ho
   Wong leading toward his senior essay. Studies the volume conjecture relating
   the Kashaev invariant to the volume of the hyperbolic knot complement, and
   proves it in the case of the figure-eight knot. Hyperbolic knots are of
   interest because the hyperbolic volume of their complement is an invariant when
   finite — it distinguishes knots and is conserved under deformation. Draws on
   representation theory, complex analysis, hyperbolic geometry, and analysis.
2. **Mostow's Rigidity Theorem** — Fall 2024, guided project under Dongryul Kim.
   Built toward a proof of Mostow rigidity for hyperbolic 3-manifolds: given two
   compact hyperbolic 3-manifolds with isomorphic fundamental group, there exists a
   unique isometry between them. Covered ergodicity, hyperbolic geometry, geodesic
   flow, and quasi-geodesics.
3. **Circle Dynamics** — Spring 2025, guided project under Ethan Cohen. Classes of
   homeomorphisms and diffeomorphisms on S¹; Poincaré classification, rotation
   number, bounded variation.

**Writings** — a subsection listing the `writings` collection, newest first. Each
entry links to `/writings/<slug>/`. Ship one placeholder Markdown post that
exercises inline math (`$\pi_1(S^3 \setminus K)$`) and display math, so KaTeX
rendering is verifiably working. Empty-state copy if the collection is empty:
name what will go here, don't apologise.

**Coursework** — four year-groups in mono type. Use a definition list, not a table:

- *Freshman* — Multivariable Calculus, Fundamentals of Physics I & II, Linear
  Algebra, Discrete Math, ODEs
- *Sophomore* — Analysis I, Group Theory, Classical Mechanics, Vector Analysis,
  Lebesgue & Fourier Analysis, Advanced Linear Algebra, Galois Theory
- *Junior* — Complex Analysis, Graduate Algebra, Quantum Mechanics, Linguistic
  Phylogenetics, Introduction to Topology, Graduate Representation Theory, reading
  projects
- *Senior* — Algebraic Topology, Bayesian Statistics, Stochastic Processes, Applied
  Machine Learning / Causal Inference, senior thesis on knot theory

## Phase 5 — Astronomy page

**Gallery** — Orion Nebula, Antares Nebula, Andromeda Galaxy. Placeholder blocks
for now, sized 3:2. Captions in mono beneath each. Build the markup so adding a
fourth image later means adding one entry to a data file, nothing more.

**Research** — STARS Summer Research Program, 2023, under Professor Charles
Bailyn. Analysed twenty years of optical and infrared data from the black hole
X-ray binary V4641 Sagittarii. Used Python, Excel, Siril, and SAOImage for stellar
data analysis; NumPy, AstroPy, and SciPy for timelines and optical data
initialisation — alignment, dithering, and differential aperture photometry.

Keep the light palette here. No dark inversion.

## Phase 6 — Hobbies page

Intro line: problem-solving games. Four entries, each with a placeholder image:

- **Factorio** — logistics, resource management, factory building.
- **NYT Crossword** — started in April, daily ever since.
- **Minesweeper** — logic on a grid; patterns accumulate with practice, and it
  rewards speedrunning.
- **Sudoku Variants** — many variants, each with its own solving techniques.

Keep the register light. This page should feel different from the Mathematics
page in tone while using identical components.

## Phase 7 — Deploy

`.github/workflows/deploy.yml` — on push to `main`: checkout, setup Node 22,
`npm ci`, `npm run build`, then `actions/configure-pages`,
`actions/upload-pages-artifact` (path `_site`), `actions/deploy-pages`. Grant
`pages: write` and `id-token: write` permissions.

Verify current major versions of those actions rather than assuming.

**Manual step for James, not Claude Code:** in the repo, go to
Settings → Pages → Build and deployment → Source, and select **GitHub Actions**.
The workflow will not publish until this is set. Flag this in the PR description.

---

## Definition of done

- `npm run build` succeeds with no errors.
- Every page renders at 360px, 768px, and 1440px.
- KaTeX renders in the placeholder writing post.
- Keyboard tab order is sensible and focus rings are visible.
- `prefers-reduced-motion: reduce` disables all animation.
- No `lh3.googleusercontent.com` URLs anywhere in the repo.
- No Git LFS.
