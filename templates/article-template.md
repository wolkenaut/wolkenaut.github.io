<!--
  ARTICLE TEMPLATE — reference only, never built into the site.

  This file lives in /templates at the repo root, outside src/, so
  Eleventy (input: "src") never sees it — it won't get built, listed, or
  linked anywhere no matter what's in it. It's purely something to copy
  from.

  To start a new article:
    1. Copy this file into src/writings/, renamed to whatever you want
       the URL slug to be, e.g. src/writings/my-new-post.md
       -> becomes https://wolkenaut.github.io/writings/my-new-post/
    2. Fill in the front matter below and delete this comment block and
       everything below the divider you don't need.
    3. Delete this comment block itself before/after copying — it's not
       valid front matter and would show up as literal text otherwise.

  Everything below the "---" front matter block is normal Markdown,
  rendered through Nunjucks first (markdownTemplateEngine: "njk" in
  eleventy.config.js) — so Nunjucks shortcodes like {% image %} work
  directly inline in the Markdown, not just in .njk template files.
-->
---
title: "Article Title Here"
date: 2026-01-01
description: "One sentence for <meta name=\"description\"> and social previews."
tags: ["math"]
pinned: false
---

<!--
  tags: pick exactly one of "math", "astronomy", "interests" — this alone
  decides where it shows up. No links to add anywhere else:
    - Home page's Academic Writings / Personal Writings lists
    - The matching topic panel's own "Writings" section
    - The all-writings "Writings" tab, grouped by subject
  All of those are populated by filtering on this tags array.

  pinned: true floats it to the top of the Home page's writings lists,
  ahead of newer posts. Leave false (or omit) for normal date-ordering.

  The permalink is /writings/{filename-without-.md}/ (see
  src/writings/writings.json) — the URL comes from the filename, not the
  title, so rename the file itself for a specific slug.
-->

Opening paragraph goes here. Plain Markdown — paragraphs, **bold**,
*italics*, [links](https://example.com), and inline math like $E = mc^2$
all work as expected.

A displayed (centered, block-level) equation:

$$
\pi_1(S^3 \setminus K) = \left\langle\, a, b \;\middle|\; R \,\right\rangle
$$

## A subheading

More prose. Article body text now spans the full container width (not
capped to a narrower readable measure) — see the note on `.prose p` in
layout.css if that ever needs revisiting.

To drop in an image, centered on its own line below the surrounding
text, use the {% image %} shortcode — NOT a raw `<img>` tag (see
CLAUDE.md's non-negotiables). It needs three things: the path relative
to src/assets/img/, alt text describing the image itself (not "a photo
of X" — say what's actually in it), and optionally a sizes hint for
responsive loading:

{% image "astro/orion-nebula.jpg", "Description of what's actually in the photo.", { sizes: "(min-width: 768px) 700px, 100vw" } %}

The image centers itself automatically (see `.prose picture, .prose img`
in layout.css) — no extra markup needed around it. Sizes defaults to
"100vw" if omitted, which is fine for most single full-width-column
images; narrow it (like the example above) only if the image will
visually render smaller than the full text column.

If the file named in {% image %} doesn't exist yet under
src/assets/img/, the build will fail with a clear error from
eleventy-img — unlike the gallery/interests grids elsewhere on the site,
inline article images don't have a placeholder fallback, so add the real
file first.

To add a small faded subtitle centered below an image, wrap the
shortcode in a plain HTML <figure>/<figcaption> — Markdown passes raw
HTML blocks through untouched, so this works directly in the .md file:

<figure>
{% image "astro/orion-nebula.jpg", "Description of what's actually in the photo." %}
<figcaption class="photo-caption">A short subtitle for the photo.</figcaption>
</figure>

The photo-caption class (components.css) is what centers the subtitle
text and adds a little space below the image — figcaption already reads
small and faded from the site-wide eyebrow/nav/time/figcaption rule in
base.css, no extra styling needed. Leave the class off if you want a
left-aligned caption instead.
