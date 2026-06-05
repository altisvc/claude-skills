/**
 * Altis Design System — Tailwind Tokens (WEB SYSTEM)
 * Source of truth: altisvc/web-v2. Re-derived 2026-06-05.
 * Import into tailwind.config.js as: const altis = require('./design-system/build/tailwind-tokens')
 *
 * NOTE: This is the WEB system (ABC Diatype / DM Sans / Freight Text Pro + navy-slate palette).
 * Altis Reports PDFs and decks use the separate REPORTS/PRINT system (Inter Tight + original
 * palette) — see tokens.json → colors.reports / typography.reports and the PDF template.
 */

module.exports = {

  colors: {
    // Brand (shared with reports)
    'altis-blue':  '#015AE9',
    'altis-cyan':  '#02B3F4', // web accent (reports/print use #01B2F4)
    'altis-white': '#FFFFFF',

    // Ink — navy text + dark surfaces
    'altis-ink-900': '#030D1F', // dark bg, max-contrast text
    'altis-ink-800': '#081830', // headings / high-emphasis
    'altis-ink-700': '#162840', // primary body text
    'altis-ink-600': '#2E4660', // mid sub-copy

    // Slate — muted text
    'altis-slate-500': '#5C6F80', // secondary / muted
    'altis-slate-400': '#7A8B9B', // tertiary / eyebrow / placeholder
    'altis-slate-300': '#98A6B5', // faint / disabled

    // Surfaces & border
    'altis-surface':        '#F6F7FA', // off-white page bg
    'altis-surface-raised': '#E8EDF5', // card / panel
    'altis-border':         '#CBD4DF', // divider

    // Semantic
    'altis-positive':        '#21A87A',
    'altis-positive-strong': '#156634',
    'altis-negative':        '#E84040',
    'altis-negative-strong': '#B52318',
    'altis-danger':          '#B84040',
  },

  fontFamily: {
    // Primary / global default — body + most headings (licensed local webfont)
    'altis-sans':  ['var(--font-abc-diatype)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
    // UI workhorse + hero display (Google font, Slides-safe)
    'altis-ui':    ['var(--font-dm-sans-family)', 'ui-sans-serif', 'sans-serif'],
    // Small editorial accent — citations, footnotes (NOT display)
    'altis-serif': ['var(--font-freight-text-pro-book)', 'ui-serif', 'serif'],
    // NOTE: The Altis logo wordmark is set in Neue Haas Grotesk Display Pro 65 (Medium),
    // embedded as outlines in the logo SVG. Never apply it to any other text.
  },

  fontSize: {
    'altis-display': ['48px', { lineHeight: '1.4', letterSpacing: '0.24px' }], // 32px mobile
    'altis-h1':      ['30px', { lineHeight: '1.2' }],
    'altis-h2':      ['24px', { lineHeight: '1.4', letterSpacing: '0.12px' }],
    'altis-subhead': ['20px', { lineHeight: '1.4' }],
    'altis-lead':    ['18px', { lineHeight: '1.4', letterSpacing: '0.12px' }],
    'altis-body':    ['16px', { lineHeight: '1.4', letterSpacing: '0.08px' }],
    'altis-body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0.07px' }], // workhorse
    'altis-caption': ['12px', { lineHeight: '1.5', letterSpacing: '0.06px' }],
    'altis-eyebrow': ['11px', { lineHeight: '1.0', letterSpacing: '0.2em' }],   // uppercase
    'altis-micro':   ['10px', { lineHeight: '1.4' }],
  },

  fontWeight: {
    'altis-regular':  '400',
    'altis-medium':   '500',
    'altis-semibold': '600', // eyebrows
    'altis-bold':     '700', // utility/legal titles
  },

  spacing: {
    'altis-1':  '4px',
    'altis-2':  '8px',
    'altis-3':  '12px',
    'altis-4':  '16px',
    'altis-5':  '20px',
    'altis-6':  '24px',
    'altis-8':  '32px',
    'altis-10': '40px',
    'altis-12': '48px',
    'altis-16': '64px',
    'altis-20': '80px',
    'altis-24': '96px',
  },

  borderRadius: {
    'altis-none':     '0',
    'altis-sm':       '6px',
    'altis-md':       '8px',   // default — cards, buttons, inputs
    'altis-lg':       '16px',
    'altis-brand-md': '32px',
    'altis-brand-lg': '64px',  // signature oversized radius
    'altis-full':     '9999px',
  },

  maxWidth: {
    'altis-container': '1440px',
  },

};
