const markdownItKatex = require("@vscode/markdown-it-katex").default;
const Image = require("@11ty/eleventy-img").default;
const fs = require("fs");
const path = require("path");

const IMG_SRC_DIR = "src/assets/img";

module.exports = function (eleventyConfig) {
  // img/ is excluded here — real photos in there are processed by the
  // {% image %} shortcode below instead of copied as-is, so raw
  // multi-megabyte originals never ship alongside the optimized output.
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  // Only the specific font files actually referenced in src/assets/css/fonts.css —
  // the fontsource packages ship many more axis/subset/weight variants than we use.
  const fontFiles = {
    "pt-serif": [
      "pt-serif-cyrillic-ext-400-normal.woff2", "pt-serif-cyrillic-ext-400-normal.woff",
      "pt-serif-cyrillic-400-normal.woff2", "pt-serif-cyrillic-400-normal.woff",
      "pt-serif-latin-ext-400-normal.woff2", "pt-serif-latin-ext-400-normal.woff",
      "pt-serif-latin-400-normal.woff2", "pt-serif-latin-400-normal.woff",
      "pt-serif-cyrillic-ext-700-normal.woff2", "pt-serif-cyrillic-ext-700-normal.woff",
      "pt-serif-cyrillic-700-normal.woff2", "pt-serif-cyrillic-700-normal.woff",
      "pt-serif-latin-ext-700-normal.woff2", "pt-serif-latin-ext-700-normal.woff",
      "pt-serif-latin-700-normal.woff2", "pt-serif-latin-700-normal.woff",
    ],
    "source-serif-4": [
      "source-serif-4-cyrillic-ext-wght-normal.woff2",
      "source-serif-4-cyrillic-wght-normal.woff2",
      "source-serif-4-greek-wght-normal.woff2",
      "source-serif-4-vietnamese-wght-normal.woff2",
      "source-serif-4-latin-ext-wght-normal.woff2",
      "source-serif-4-latin-wght-normal.woff2",
    ],
  };
  const fontPackages = {
    "pt-serif": "@fontsource/pt-serif",
    "source-serif-4": "@fontsource-variable/source-serif-4",
  };
  const fontCopyMap = {};
  for (const [font, files] of Object.entries(fontFiles)) {
    for (const file of files) {
      fontCopyMap[`node_modules/${fontPackages[font]}/files/${file}`] = `assets/fonts/${font}/files/${file}`;
    }
  }
  eleventyConfig.addPassthroughCopy(fontCopyMap);
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "assets/vendor/katex/katex.min.css",
    "node_modules/katex/dist/fonts": "assets/vendor/katex/fonts",
    "src/.nojekyll": ".nojekyll",
  });
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(dateObj)
  );
  eleventyConfig.addFilter("isoDate", (dateObj) => dateObj.toISOString().slice(0, 10));
  eleventyConfig.addFilter("byTag", (posts, tag) => (posts || []).filter((p) => (p.data.tags || []).includes(tag)));
  eleventyConfig.addFilter("byAnyTag", (posts, tags) => (posts || []).filter((p) => (p.data.tags || []).some((t) => tags.includes(t))));
  eleventyConfig.addFilter("primaryTag", (tags) => (tags || []).find((t) => t !== "writings") || "");
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  // Pinned posts (front matter `pinned: true`) float to the top; everything
  // else keeps whatever order it was already in (i.e. sort by date first).
  eleventyConfig.addFilter("pinnedFirst", (posts) => {
    const pinned = (posts || []).filter((p) => p.data.pinned);
    const rest = (posts || []).filter((p) => !p.data.pinned);
    return [...pinned, ...rest];
  });

  // Lets templates check whether a real photo has been dropped in yet
  // (e.g. `{% if item.filename | fileExists %}`) and fall back to a
  // placeholder-block when it hasn't, rather than every image needing a
  // template edit before it can be used.
  eleventyConfig.addFilter("fileExists", (relPath) =>
    !!relPath && fs.existsSync(path.join(IMG_SRC_DIR, relPath))
  );

  // {% image "astro/orion-nebula.jpg", "Alt text", { sizes: "..." } %}
  // relPath is relative to src/assets/img/. Works in .njk templates and,
  // since markdownTemplateEngine is "njk", inline in writings' Markdown
  // too. Generates responsive WebP + JPEG <picture> markup; original
  // files are never shipped as-is (see the passthrough copy note above).
  eleventyConfig.addAsyncShortcode("image", async function (relPath, alt, options = {}) {
    if (typeof alt !== "string") {
      throw new Error(`{% image %} is missing alt text for "${relPath}" — pass "" explicitly for decorative images.`);
    }

    const metadata = await Image(path.join(IMG_SRC_DIR, relPath), {
      widths: [400, 800, 1200, 1600],
      formats: ["webp", "jpeg"],
      outputDir: "_site/assets/img/generated/",
      urlPath: "/assets/img/generated/",
      filenameFormat: (id, src, width, format) => {
        const name = path.basename(src, path.extname(src)).replace(/[^a-z0-9-]+/gi, "-");
        return `${name}-${width}w.${format}`;
      },
    });

    const imageAttributes = {
      alt,
      sizes: options.sizes || "100vw",
      loading: "lazy",
      decoding: "async",
    };
    if (options.class) imageAttributes.class = options.class;

    return Image.generateHTML(metadata, imageAttributes);
  });

  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItKatex, { throwOnError: false });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
