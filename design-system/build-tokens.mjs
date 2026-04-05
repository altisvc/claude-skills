/**
 * Altis Design System — Token Pipeline
 * Reads sd-tokens/*.json → generates CSS, SCSS, Tailwind JS, flat JSON
 * Run: node design-system/build-tokens.mjs
 */

import StyleDictionary from 'style-dictionary';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUILD_PATH = path.join(__dirname, 'build') + '/';

// Ensure build dir exists
fs.mkdirSync(BUILD_PATH, { recursive: true });

const sd = new StyleDictionary({
  source: [path.join(__dirname, 'sd-tokens/**/*.json')],

  platforms: {

    // ── CSS Custom Properties ──────────────────────────────────────
    css: {
      transformGroup: 'css',
      buildPath: BUILD_PATH,
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

    // ── SCSS Variables ─────────────────────────────────────────────
    scss: {
      transformGroup: 'scss',
      buildPath: BUILD_PATH,
      files: [
        {
          destination: 'tokens.scss',
          format: 'scss/variables',
        },
      ],
    },

    // ── Flat JSON ──────────────────────────────────────────────────
    json: {
      transformGroup: 'js',
      buildPath: BUILD_PATH,
      files: [
        {
          destination: 'tokens-flat.json',
          format: 'json/flat',
        },
      ],
    },

    // ── JavaScript ES Module ───────────────────────────────────────
    js: {
      transformGroup: 'js',
      buildPath: BUILD_PATH,
      files: [
        {
          destination: 'tokens.mjs',
          format: 'javascript/es6',
        },
      ],
    },

  },
});

await sd.buildAllPlatforms();
console.log('\n✓ Token pipeline complete. Output in design-system/build/');
