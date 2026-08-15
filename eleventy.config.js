const markdownItKatex = require("@vscode/markdown-it-katex").default;

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
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
