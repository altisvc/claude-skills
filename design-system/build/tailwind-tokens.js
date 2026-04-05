/**
 * Altis Design System — Tailwind Tokens
 * Auto-generated from tokens.json via build-tokens.mjs
 * Import into tailwind.config.js as: const altis = require('./design-system/build/tailwind-tokens')
 */

module.exports = {

  colors: {
    // Core brand colors
    'altis-navy':  '#030F1F',
    'altis-blue':  '#015AE9',
    'altis-cyan':  '#01B2F4',
    'altis-white': '#FFFFFF',

    // Secondary palette
    'altis-purple': '#814DC6',
    'altis-teal':   '#00A6A6',
    'altis-coral':  '#FF6663',
    'altis-orange': '#F28C59',
    'altis-yellow': '#F2DA3D',
    'altis-green':  '#4BD66A',

    // Expanded — Navy family
    'altis-navy-dark':  '#030F1F',
    'altis-navy-mid':   '#0A3166',
    'altis-navy-light': '#0F4A99',

    // Expanded — Blue family
    'altis-blue-core':  '#015AE9',
    'altis-blue-mid':   '#4089FF',
    'altis-blue-light': '#AAC5F2',

    // Expanded — Sky family
    'altis-sky-core':  '#01B2F4',
    'altis-sky-mid':   '#86D6F4',
    'altis-sky-light': '#ACD6E5',

    // Expanded — Teal family
    'altis-teal-core':  '#00A6A6',
    'altis-teal-mid':   '#60BFBF',
    'altis-teal-light': '#A3D9D9',

    // Expanded — Purple family
    'altis-purple-core':  '#814DC6',
    'altis-purple-mid':   '#AD92D1',
    'altis-purple-light': '#DECEF2',

    // Expanded — Coral family
    'altis-coral-core':  '#FF6663',
    'altis-coral-mid':   '#FF8987',
    'altis-coral-light': '#FFC0BF',

    // Expanded — Orange family
    'altis-orange-core':  '#F28C59',
    'altis-orange-mid':   '#F2A985',
    'altis-orange-light': '#FFCCB2',

    // Expanded — Yellow family
    'altis-yellow-core':  '#F2DA3D',
    'altis-yellow-mid':   '#F2E279',
    'altis-yellow-light': '#F2ECC2',

    // Expanded — Green family
    'altis-green-core':  '#4BD66A',
    'altis-green-mid':   '#82ED9A',
    'altis-green-light': '#B8F5C5',
  },

  fontFamily: {
    // Body text, bullets, captions, UI elements
    'altis-primary': ['Inter', 'system-ui', '-apple-system', "'Segoe UI'", 'Roboto', 'sans-serif'],
    // Headlines, section headers, slide titles
    'altis-heading': ['Inter Tight', 'Inter', 'system-ui', '-apple-system', "'Segoe UI'", 'Roboto', 'sans-serif'],
    // Email-safe fallback (Inter may not be installed on all email clients)
    'altis-email':   ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
    // NOTE: The Altis logo wordmark uses a proprietary font embedded in the SVG.
    // Never apply it to any other text. Use logo SVG files only.
  },

  fontSize: {
    'altis-display': ['48px', { lineHeight: '1.1' }],
    'altis-h1':      ['36px', { lineHeight: '1.15' }],
    'altis-h2':      ['28px', { lineHeight: '1.2' }],
    'altis-h3':      ['22px', { lineHeight: '1.25' }],
    'altis-h4':      ['18px', { lineHeight: '1.3' }],
    'altis-body':    ['16px', { lineHeight: '1.6' }],
    'altis-small':   ['14px', { lineHeight: '1.5' }],
    'altis-label':   ['12px', { lineHeight: '1.4' }],
    'altis-caption': ['11px', { lineHeight: '1.4' }],
  },

  fontWeight: {
    'altis-regular': '400',
    'altis-medium':  '500',
    'altis-bold':    '700',
    'altis-black':   '800',
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
    'altis-none': '0',
    'altis-sm':   '4px',
    'altis-md':   '8px',
    'altis-lg':   '16px',
    'altis-xl':   '24px',
    'altis-full': '9999px',
  },

};
