/**
 * Style Dictionary config — Altis Design System
 * Generates: CSS custom properties, Tailwind tokens JS, SCSS variables, flat JSON
 * Run: npm run build-tokens
 */

module.exports = {
  source: ['design-system/sd-tokens/**/*.json'],

  platforms: {

    // ── CSS Custom Properties ─────────────────────────────────────────
    css: {
      transformGroup: 'css',
      buildPath: 'design-system/build/',
      prefix: 'altis',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: false,
          },
        },
      ],
    },

    // ── SCSS Variables ────────────────────────────────────────────────
    scss: {
      transformGroup: 'scss',
      buildPath: 'design-system/build/',
      files: [
        {
          destination: 'tokens.scss',
          format: 'scss/variables',
        },
      ],
    },

    // ── Flat JSON ─────────────────────────────────────────────────────
    json: {
      transformGroup: 'js',
      buildPath: 'design-system/build/',
      files: [
        {
          destination: 'tokens-flat.json',
          format: 'json/flat',
        },
      ],
    },

    // ── JavaScript ES Module (for Tailwind) ──────────────────────────
    js: {
      transformGroup: 'js',
      buildPath: 'design-system/build/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
      ],
    },

  },
};
